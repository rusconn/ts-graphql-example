import { v7 as uuidv7 } from "uuid";

import type {
  MutationCreatePostArgs,
  MutationReplyToPostArgs,
  MutationResolvers,
} from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { dateByUuid, forbiddenErr } from "../../common/resolvers.ts";
import { parsePostNodeId } from "../common/parser.ts";
import { CONTENT_MAX } from "./createPost.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    replyToPost(
      id: ID!

      """
      ${CONTENT_MAX}文字まで
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

  const id = uuidv7();
  const idDate = dateByUuid(id);

  const reply = await context.db
    .insertInto("Post")
    .values({
      id,
      updatedAt: idDate,
      content: parsed.content,
      userId: authed.id,
      parentId: parsed.id,
    })
    .returningAll()
    .executeTakeFirst();

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
  const parsed = parsePostNodeId(args.id);

  if (parsed instanceof Error) {
    return parsed;
  }

  const { content } = args;

  if (numChars(content) > CONTENT_MAX) {
    return parseErr(`"content" must be up to ${CONTENT_MAX} characters`);
  }

  return { id: parsed, content };
};

if (import.meta.vitest) {
  const { postNodeId } = await import("../common/adapter.ts");

  describe("Parsing", () => {
    const valids = [
      //
      { content: "content" },
      { content: "A".repeat(CONTENT_MAX) },
    ] as Omit<MutationCreatePostArgs, "id">[];

    const invalids = [
      //
      { content: "A".repeat(CONTENT_MAX + 1) },
    ] as Omit<MutationCreatePostArgs, "id">[];

    const id = postNodeId("0193cb3e-5fdd-7264-9f70-1df63d84b251");

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
