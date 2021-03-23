import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import { __prod__ } from "./constants";
import config from './mikro-orm.config';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import "reflect-metadata";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";


const main = async () => {
  // <-- MIKRO-ORM -->
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();
  // <-- MIKRO-ORM -->

  const app = express();

  // <-- REDIS -->
  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  // <-- SESSION -->
  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true
      }),
      secret: 'someRandomString',
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax', // csrf
        secure: __prod__ // cookie only works in https
      },
      saveUninitialized: false,
    })
  )
  // <-- SESSION -->

  // <-- REDIS -->

  // <-- APOLLO -->
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        HelloResolver,
        PostResolver,
        UserResolver
      ],
      validate: false
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  });

  apolloServer.applyMiddleware({ app })
  // <-- APOLLO -->

  app.listen(4000, () => {
    console.log('Server started on localhost:4000');
  });
}

main().catch(console.error);