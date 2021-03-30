import {
  Entity,
  Property
} from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Base } from './Base';

@ObjectType()
@Entity()
export class User extends Base {
  @Field()
  @Property({ type: 'text', unique: true })
  username!: string;

  @Field()
  @Property({ type: 'text', unique: true })
  email!: string;

  @Property({ type: 'text' })
  password!: string;
}
