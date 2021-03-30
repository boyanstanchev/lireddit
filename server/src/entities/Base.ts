import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from 'uuid';

@ObjectType()
@Entity({ abstract: true })
export abstract class Base {
  // Adding @Field exposes it to the graphql
  @Field(() => String)
  @PrimaryKey()
  uuid: string = v4();

  @Field(() => String)
  @Property()
  createdAt: Date = new Date();

  @Field(() => String)
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}