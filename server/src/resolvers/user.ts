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
import { v4 } from 'uuid';
import { AUTH_COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants';
import { UserInput } from './UserInput';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { getConnection } from 'typeorm';

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
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('newPassword') newPassword: string,
    @Arg('token') token: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Length must be greater than 2',
          },
        ],
      };
    }

    const key = FORGOT_PASSWORD_PREFIX + token;

    const userId = await redis.get(key);

    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Token Expired',
          },
        ],
      };
    }

    const user = await User.findOne(userId);

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'User No Longer Exists',
          },
        ],
      };
    }

    await User.update(
      { id: userId },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);

    req.session.userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    // .findOne(id) only works for primary columns
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return false;
    }

    const token = v4();

    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    );

    await sendEmail(
      email,
      'Forgotten Password',
      `
      <a href="http://localhost:3000/change-password/${token}">Reset Password</a>
    `
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('input') { email, username, password }: UserInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister({ email, username, password });

    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(password);

    let user;

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email,
          username,
          password: hashedPassword,
        })
        .returning('*')
        .execute();

      user = new User() as any;
    } catch (error) {
      if (error.detail.includes('already exists')) {
        return {
          errors: [
            {
              field: 'username',
              message: 'Username already taken',
            },
          ],
        };
      }
    }

    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({
      where: usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail },
    });

    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'Such user does not exist',
          },
        ],
      };
    }

    const passwordValid = await argon2.verify(user.password, password);

    if (!passwordValid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Passwords do not match',
          },
        ],
      };
    }

    req.session!.userId = user.id;

    return {
      user,
    };
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    return User.findOne(req.session.userId);
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(AUTH_COOKIE_NAME);

        if (err) {
          console.error(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
