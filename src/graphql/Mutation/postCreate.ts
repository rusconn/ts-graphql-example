import type { MutationPostCreateArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { POST_CONTENT_MAX, parsePostContent } from "../_parsers/post/content.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postCreate(
      """
      ${POST_CONTENT_MAX}文字まで
      """
      content: NonEmptyString!
    ): PostCreateResult
  }

  union PostCreateResult = PostCreateSuccess | InvalidInputError

  type PostCreateSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["postCreate"] = async (_parent, args, context) => {
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

  const created = await context.api.post.create({
    content: parsed.content,
    userId: authed.id,
    parentId: null,
  });

  if (!created) {
    throw internalServerError();
  }

  return {
    __typename: "PostCreateSuccess",
    post: created,
  };
};

const parseArgs = (args: MutationPostCreateArgs) => {
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
    ] as MutationPostCreateArgs[];

    const invalids = [
      //
      { content: "A".repeat(POST_CONTENT_MAX + 1) },
    ] as MutationPostCreateArgs[];

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
