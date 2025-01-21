import type { MutationPostEditArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { POST_CONTENT_MAX, parsePostContent } from "../_parsers/post/content.ts";
import { parsePostId } from "../_parsers/post/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postEdit(
      id: ID!

      """
      ${POST_CONTENT_MAX}文字まで
      """
      content: NonEmptyString!
    ): PostEditResult
  }

  union PostEditResult = PostEditSuccess | InvalidInputError | ResourceNotFoundError

  type PostEditSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["postEdit"] = async (_parent, args, context) => {
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

  const edited = await context.api.post.update(
    { id: parsed.id, userId: authed.id },
    { content: parsed.content },
  );

  return edited
    ? {
        __typename: "PostEditSuccess",
        post: edited,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};

const parseArgs = (args: MutationPostEditArgs) => {
  const id = parsePostId(args);

  if (id instanceof Error) {
    return id;
  }

  const content = parsePostContent(args, {
    optional: false,
    nullable: false,
  });

  if (content instanceof Error) {
    return content;
  }

  return { id, content };
};

if (import.meta.vitest) {
  const { postId } = await import("../_adapters/post/id.ts");

  describe("Parsing", () => {
    const valids = [
      //
      { content: "content" },
      { content: "A".repeat(POST_CONTENT_MAX) },
    ] as Omit<MutationPostEditArgs, "id">[];

    const invalids = [
      //
      { content: "A".repeat(POST_CONTENT_MAX + 1) },
    ] as Omit<MutationPostEditArgs, "id">[];

    const id = postId("0193cb3e-5fdd-7264-9f70-1df63d84b251");

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs({ id, ...args });
      expect(parsed instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", (args) => {
      const parsed = parseArgs({ id, ...args });
      expect(parsed instanceof Error).toBe(true);
    });
  });
}
