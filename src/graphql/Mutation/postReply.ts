import type {
  MutationPostCreateArgs,
  MutationPostReplyArgs,
  MutationResolvers,
} from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { POST_CONTENT_MAX, parsePostContent } from "../_parsers/post/content.ts";
import { parsePostId } from "../_parsers/post/id.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postReply(
      id: ID!

      """
      ${POST_CONTENT_MAX}文字まで
      """
      content: String!
    ): PostReplyResult @semanticNonNull
  }

  union PostReplyResult = PostReplySuccess | InvalidInputErrors | ResourceNotFoundError

  type PostReplySuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["postReply"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parsePostId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }

  const parsed = parseArgs(args);

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const result = await context.api.post.create({
    content: parsed.content,
    authorId: authed.id,
    parentId: id,
  });

  switch (result.type) {
    case "Success":
      return {
        __typename: "PostReplySuccess",
        post: result.post,
      };
    case "PostNotExists":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified post does not exist.",
      };
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: Omit<MutationPostReplyArgs, "id">) => {
  const content = parsePostContent(args.content, "content", {
    optional: false,
    nullable: false,
  });

  if (
    content instanceof ParseErr //
  ) {
    const errors = [];

    if (content instanceof ParseErr) {
      errors.push(content);
    }

    return errors;
  } else {
    return { content };
  }
};

if (import.meta.vitest) {
  describe("Parsing", () => {
    const valids: Omit<MutationPostCreateArgs, "id">[] = [
      { content: "content" },
      { content: "A".repeat(POST_CONTENT_MAX) },
    ];

    const invalids: [
      Omit<MutationPostCreateArgs, "id">,
      (keyof Omit<MutationPostCreateArgs, "id">)[],
    ][] = [[{ content: "A".repeat(POST_CONTENT_MAX + 1) }, ["content"]]];

    test.each(valids)("valids %#", (args) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(false);
    });

    test.each(invalids)("invalids %#", (args, fields) => {
      const parsed = parseArgs(args);
      expect(Array.isArray(parsed)).toBe(true);
      expect((parsed as ParseErr[]).map((e) => e.field)).toStrictEqual(fields);
    });
  });
}
