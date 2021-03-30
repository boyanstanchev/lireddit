import {
  Entity,
  Property
} from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Base } from './Base';

@ObjectType()
@Entity()
export class Post extends Base {
  @Field()
  @Property({ type: 'text' })
  title!: string;
}
