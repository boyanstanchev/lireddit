import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { AUTH_COOKIE_NAME, __prod__ } from './constants';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import 'reflect-metadata';
import { UserResolver } from './resolvers/user';
import Redis from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from './types';
import cors from 'cors';
import { createConnection } from 'typeorm';
import { Post } from './entities/Post';
import { User } from './entities/User';

const main = async () => {
  // <-- TYPEORM -->
  const conn = await createConnection({
    type: 'postgres',
    database: 'lireddit2',
    username: 'postgres',
    password: 'root',
    logging: true,
    synchronize: true,
    entities: [Post, User], // 'src/entities/**/*.ts'
  });
  console.log(conn);
  // <-- TYPEORM -->

  const app = express();

  // <-- REDIS -->
  const RedisStore = connectRedis(session);
  const redis = new Redis();

  // <-- SESSION -->
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );

  app.use(
    session({
      name: AUTH_COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      secret: 'someRandomString',
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
    })
  );
  // <-- SESSION -->

  // <-- REDIS -->

  // <-- APOLLO -->
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });
  // <-- APOLLO -->

  app.listen(4000, () => {
    console.log('Server started on localhost:4000');
  });
};

main().catch(console.error);
