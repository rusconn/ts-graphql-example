import type { MutationPostCreateArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { POST_CONTENT_MAX, parsePostContent } from "../_parsers/post/content.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postCreate(
      """
      ${POST_CONTENT_MAX}文字まで
      """
      content: String!
    ): PostCreateResult @semanticNonNull
  }

  union PostCreateResult = PostCreateSuccess | InvalidInputErrors

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

  if (Array.isArray(parsed)) {
    return invalidInputErrors(parsed);
  }

  const result = await context.api.post.create({
    content: parsed.content,
    authorId: authed.id,
    parentId: null,
  });

  switch (result.type) {
    case "Success":
      return {
        __typename: "PostCreateSuccess",
        post: result.post,
      };
    case "PostNotExists":
      throw new Error("unreachable");
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};

const parseArgs = (args: MutationPostCreateArgs) => {
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
    const valids: MutationPostCreateArgs[] = [
      { content: "content" },
      { content: "A".repeat(POST_CONTENT_MAX) },
    ];

    const invalids: [MutationPostCreateArgs, (keyof MutationPostCreateArgs)[]][] = [
      [{ content: "A".repeat(POST_CONTENT_MAX + 1) }, ["content"]], //
    ];

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
