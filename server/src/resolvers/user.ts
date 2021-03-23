import argon2 from 'argon2';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';
import { User } from '../entities/User';
import { MyContext } from '../types';

@InputType()
class RegisterInput {
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
    @Arg('input') { username, password }: RegisterInput,
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

    const user = em.create(User, {
      username,
      password: hashedPassword,
    });

    try {
      await em.persistAndFlush(user);
    } catch (error) {
      if (error.code === '23505') {
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
    @Arg('input') { username, password }: RegisterInput,
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
}
