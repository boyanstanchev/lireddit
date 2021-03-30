import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { EntityManager } from '@mikro-orm/postgresql'
import { v4 } from 'uuid';
import { AUTH_COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { UserInput } from './UserInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { em, redis }: MyContext
  ) {
    const user = await em.findOne(User, { email });

    if (!user) {
      return true;
    }

    const token = v4();

    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.uuid,
      'ex',
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(email, 'Forgotten Password', `
      <a href="http://localhost:3000/change-password/${token}">Reset Password</a>
    `);

    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('input') { email, username, password }: UserInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister({ email, username, password });

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(password);

    let user;

    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          uuid: v4(),
          email,
          username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date()
        }).returning('*');

      user = result[0];
    } catch (error) {
      if (error.detail.includes('already exists')) {
        return {
          errors: [{
            field: 'username',
            message: 'Username already taken'
          }]
        }
      }
    }

    req.session!.userId = user.uuid;

    return {
      user
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, usernameOrEmail.includes('@')
      ? { email: usernameOrEmail }
      : { username: usernameOrEmail }
    );

    if (!user) {
      return {
        errors: [{
          field: 'usernameOrEmail',
          message: 'Such user does not exist'
        }]
      }
    }

    const passwordValid = await argon2.verify(user.password, password);

    if (!passwordValid) {
      return {
        errors: [{
          field: 'password',
          message: 'Passwords do not match'
        }]
      }
    }

    req.session!.userId = user.uuid;

    return {
      user
    }
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    return em.findOne(User, { uuid: req.session.userId });
  }

  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ): Promise<boolean> {
    return new Promise(resolve => req.session.destroy(err => {
      res.clearCookie(AUTH_COOKIE_NAME);

      if (err) {
        console.error(err);
        resolve(false);
        return;
      }

      resolve(true);
    }));
  }
}
