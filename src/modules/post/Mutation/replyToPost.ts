import type {
  MutationCreatePostArgs,
  MutationReplyToPostArgs,
  MutationResolvers,
} from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { POST_CONTENT_MAX, parsePostContent } from "../parsers/content.ts";
import { parsePostId } from "../parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    replyToPost(
      id: ID!

      """
      ${POST_CONTENT_MAX}文字まで
      """
      content: NonEmptyString!
    ): ReplyToPostResult
  }

  union ReplyToPostResult = ReplyToPostSuccess | InvalidInputError | ResourceNotFoundError

  type ReplyToPostSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["replyToPost"] = async (_parent, args, context) => {
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

  const reply = await context.api.user.createPost(authed.id, {
    content: parsed.content,
    parentId: parsed.id,
  });

  return reply
    ? {
        __typename: "ReplyToPostSuccess",
        post: reply,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};

const parseArgs = (args: MutationReplyToPostArgs) => {
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
  const { postId } = await import("../adapters/id.ts");

  describe("Parsing", () => {
    const valids = [
      //
      { content: "content" },
      { content: "A".repeat(POST_CONTENT_MAX) },
    ] as Omit<MutationCreatePostArgs, "id">[];

    const invalids = [
      //
      { content: "A".repeat(POST_CONTENT_MAX + 1) },
    ] as Omit<MutationCreatePostArgs, "id">[];

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
