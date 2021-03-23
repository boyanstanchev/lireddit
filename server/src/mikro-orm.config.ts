import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";

export default {
  entities: ['./dist/entities/*.js'],
  entitiesTs: ['./src/entities/*.ts'],
  dbName: 'lireddit',
  password: 'root',
  debug: !__prod__,
  type: 'postgresql',
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  }
} as Parameters<typeof MikroORM.init>[0];
