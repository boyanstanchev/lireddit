import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types';
import { EntityManager } from '@mikro-orm/postgresql'
import { v4 } from 'uuid';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

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
  @Mutation(() => UserResponse)
  async register(
    @Arg('input') { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'Username length must be greater than 2'
        }]
      }
    }

    if (password.length <= 3) {
      return {
        errors: [{
          field: 'password',
          message: 'Password length must be greater than 3'
        }]
      }
    }

    const hashedPassword = await argon2.hash(password);

    let user;

    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          uuid: v4(),
          username: username,
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
    @Arg('input') { username, password }: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username })

    if (!user) {
      return {
        errors: [{
          field: 'username',
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
}
