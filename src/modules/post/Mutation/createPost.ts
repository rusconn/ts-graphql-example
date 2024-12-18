import { v7 as uuidv7 } from "uuid";

import type { MutationCreatePostArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { dateByUuid, forbiddenErr } from "../../common/resolvers.ts";

export const CONTENT_MAX = 280;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    createPost(
      """
      ${CONTENT_MAX}文字まで
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

  const id = uuidv7();
  const idDate = dateByUuid(id);

  const created = await context.db
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
    post: created,
  };
};

const parseArgs = (args: MutationCreatePostArgs) => {
  const { content } = args;

  if (numChars(content) > CONTENT_MAX) {
    return parseErr(`"content" must be up to ${CONTENT_MAX} characters`);
  }

  return { content };
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids = [
      { content: "content" },
      { content: "A".repeat(CONTENT_MAX) },
    ] as MutationCreatePostArgs[];

    const invalids = [
      //
      { content: "A".repeat(CONTENT_MAX + 1) },
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
