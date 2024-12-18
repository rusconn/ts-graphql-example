import { v7 as uuidv7 } from "uuid";

import type { MutationCreatePostArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { dateByUuid } from "../../common/resolvers.ts";

export const CONTENT_MAX = 280;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    createPost(input: CreatePostInput!): CreatePostResult
  }

  input CreatePostInput {
    "${CONTENT_MAX}文字まで"
    content: NonEmptyString!
  }

  union CreatePostResult = CreatePostSuccess

  type CreatePostSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["createPost"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const parsed = parseArgs(args);

  const id = uuidv7();
  const idDate = dateByUuid(id);

  const post = await context.db
    .insertInto("Post")
    .values({
      id,
      updatedAt: idDate,
      content: parsed.content,
      userId: authed.id,
      parentId: null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return {
    __typename: "CreatePostSuccess",
    post,
  };
};

const parseArgs = (args: MutationCreatePostArgs) => {
  const { content } = args.input;

  if (numChars(content) > CONTENT_MAX) {
    throw parseErr(`"content" must be up to ${CONTENT_MAX} characters`);
  }

  return { content };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");

  describe("Parsing", () => {
    const valids = [
      { content: "content" },
      { content: "A".repeat(CONTENT_MAX) },
    ] as MutationCreatePostArgs["input"][];

    const invalids = [
      { content: "A".repeat(CONTENT_MAX + 1) },
    ] as MutationCreatePostArgs["input"][];

    test.each(valids)("valids %#", (input) => {
      parseArgs({ input });
    });

    test.each(invalids)("invalids %#", (input) => {
      expect.assertions(1);
      try {
        parseArgs({ input });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
