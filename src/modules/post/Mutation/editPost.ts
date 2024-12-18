import type { MutationEditPostArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { parsePostNodeId } from "../common/parser.ts";
import { CONTENT_MAX } from "./createPost.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    editPost(
      id: ID!

      """
      ${CONTENT_MAX}文字まで
      """
      content: NonEmptyString!
    ): EditPostResult
  }

  union EditPostResult = EditPostSuccess | InvalidInputError | ResourceNotFoundError

  type EditPostSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["editPost"] = async (_parent, args, context) => {
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

  const edited = await context.db
    .updateTable("Post")
    .where("id", "=", parsed.id)
    .where("userId", "=", authed.id)
    .set({
      updatedAt: new Date(),
      content: parsed.content,
    })
    .returningAll()
    .executeTakeFirst();

  return edited
    ? {
        __typename: "EditPostSuccess",
        post: edited,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};

const parseArgs = (args: MutationEditPostArgs) => {
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
    ] as Omit<MutationEditPostArgs, "id">[];

    const invalids = [
      //
      { content: "A".repeat(CONTENT_MAX + 1) },
    ] as Omit<MutationEditPostArgs, "id">[];

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
