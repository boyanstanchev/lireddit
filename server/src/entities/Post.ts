import { Field, ObjectType } from 'type-graphql';
import { Column, Entity } from 'typeorm';
import { Base } from './Base';

@ObjectType()
@Entity()
export class Post extends Base {
  @Field()
  @Column()
  title!: string;
}
