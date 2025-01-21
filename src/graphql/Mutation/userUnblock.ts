import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userUnblock(id: ID!): UserUnblockResult
  }

  union UserUnblockResult = UserUnblockSuccess | InvalidInputError | ResourceNotFoundError

  type UserUnblockSuccess {
    unblocker: User!
    unblockee: User!
    alreadyUnblocked: Boolean!
  }
`;

export const resolver: MutationResolvers["userUnblock"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseUserId(args);

  if (parsed instanceof Error) {
    return {
      __typename: "InvalidInputError",
      message: parsed.message,
    };
  }
  if (authed.id === parsed) {
    return {
      __typename: "InvalidInputError",
      message: "can't unblock yourself",
    };
  }

  const result = await context.db.transaction().execute(async (trx) => {
    const unblockee = await context.api.user.getById(parsed, trx);

    if (!unblockee) {
      return { type: "notFound" } as const;
    }

    const block = await context.api.block.delete(
      { blockerId: authed.id, blockeeId: unblockee.id },
      trx,
    );

    return { type: "ok", unblockee, block } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "user not found",
      };
    case "ok":
      return {
        __typename: "UserUnblockSuccess",
        unblocker: authed,
        unblockee: result.unblockee,
        alreadyUnblocked: !result.block,
      };
    default:
      throw new Error(result satisfies never);
  }
};
