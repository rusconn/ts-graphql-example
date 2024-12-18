import type { MutationEditPostArgs, MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { numChars, parseErr } from "../../common/parsers.ts";
import { parsePostNodeId } from "../common/parser.ts";
import { CONTENT_MAX } from "./createPost.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    editPost(id: ID!, input: EditPostInput!): EditPostResult
  }

  input EditPostInput {
    "${CONTENT_MAX}文字まで"
    content: NonEmptyString!
  }

  union EditPostResult = EditPostSuccess | ResourceNotFoundError

  type EditPostSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["editPost"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const parsed = parseArgs(args);

  const post = await context.db
    .updateTable("Post")
    .where("id", "=", parsed.id)
    .where("userId", "=", authed.id)
    .set({
      updatedAt: new Date(),
      content: parsed.content,
    })
    .returningAll()
    .executeTakeFirst();

  return post
    ? {
        __typename: "EditPostSuccess",
        post,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "post not found",
      };
};

const parseArgs = (args: MutationEditPostArgs) => {
  const id = parsePostNodeId(args.id);

  const { content } = args.input;

  if (numChars(content) > CONTENT_MAX) {
    throw parseErr(`"content" must be up to ${CONTENT_MAX} characters`);
  }

  return { id, content };
};

if (import.meta.vitest) {
  const { ErrorCode } = await import("../../../schema.ts");
  const { postNodeId } = await import("../common/adapter.ts");

  describe("Parsing", () => {
    const valids = [
      { content: "content" },
      { content: "A".repeat(CONTENT_MAX) },
    ] as MutationEditPostArgs["input"][];

    const invalids = [
      //
      { content: "A".repeat(CONTENT_MAX + 1) },
    ] as MutationEditPostArgs["input"][];

    const id = postNodeId("0193cb3e-5fdd-7264-9f70-1df63d84b251");

    test.each(valids)("valids %#", (input) => {
      parseArgs({ id, input });
    });

    test.each(invalids)("invalids %#", (input) => {
      expect.assertions(1);
      try {
        parseArgs({ id, input });
      } catch (e) {
        expect(e).toHaveProperty("extensions.code", ErrorCode.BadUserInput);
      }
    });
  });
}
