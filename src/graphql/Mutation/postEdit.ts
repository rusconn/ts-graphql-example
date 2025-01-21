import type { MutationPostEditArgs, MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { POST_CONTENT_MAX, parsePostContent } from "../_parsers/post/content.ts";
import { parsePostId } from "../_parsers/post/id.ts";
import { ParseErr, invalidInputErrors } from "../_parsers/util.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    postEdit(
      id: ID!

      """
      ${POST_CONTENT_MAX}文字まで
      """
      content: String!
    ): PostEditResult @semanticNonNull
  }

  union PostEditResult = PostEditSuccess | InvalidInputErrors | ResourceNotFoundError

  type PostEditSuccess {
    post: Post!
  }
`;

export const resolver: MutationResolvers["postEdit"] = async (_parent, args, context) => {
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

  const edited = await context.api.post.update(
    { id, authorId: authed.id },
    { content: parsed.content },
  );

  return edited
    ? {
        __typename: "PostEditSuccess",
        post: edited,
      }
    : {
        __typename: "ResourceNotFoundError",
        message: "The specified post does not exist.",
      };
};

const parseArgs = (args: Omit<MutationPostEditArgs, "id">) => {
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
    const valids: Omit<MutationPostEditArgs, "id">[] = [
      { content: "content" }, //
      { content: "A".repeat(POST_CONTENT_MAX) },
    ];

    const invalids: [
      Omit<MutationPostEditArgs, "id">,
      (keyof Omit<MutationPostEditArgs, "id">)[],
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
