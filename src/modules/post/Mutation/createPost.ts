import type { MutationCreatePostArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import * as postId from "../internal/id.ts";
import { POST_CONTENT_MAX, parsePostContent } from "../parsers/content.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    createPost(
      """
      ${POST_CONTENT_MAX}文字まで
      """
      content: NonEmptyString!
    ): CreatePostResult
  }

  union CreatePostResult = CreatePostSuccess | InvalidInputError

  type CreatePostSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["createPost"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseArgs(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }

  const { id, date } = postId.genWithDate();

  const created = await context.db
    .insertInto("Post")
    .values({
      id,
      updatedAt: date,
      content: parsed.content,
      userId: authed.id,
      parentId: null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    __typename: "CreatePostSuccess",
    post: created,
  };
};

const parseArgs = (args: MutationCreatePostArgs) => {
  const content = parsePostContent(args, {
    optional: false,
    nullable: false,
  });

  if (content instanceof Error) {
    return content;
  }

  return { content };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [
      { content: "content" },
      { content: "A".repeat(POST_CONTENT_MAX) },
    ] as MutationCreatePostArgs[];

    const invalids = [
      //
      { content: "A".repeat(POST_CONTENT_MAX + 1) },
    ] as MutationCreatePostArgs[];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs(args);
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
