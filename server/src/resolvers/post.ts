import { MyContext } from "../types";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg('uuid') uuid: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, {
      uuid
    });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });

    await em.persistAndFlush(post);

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('uuid') uuid: string,
    @Arg('title') title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { uuid });

    if (!post) {
      return null;
    }

    post.title = title;

    await em.persistAndFlush(post);

    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('uuid') uuid: string,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    return !!await em.nativeDelete(Post, { uuid });
  }
}
