import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userBlock(id: ID!): UserBlockResult
  }

  union UserBlockResult = UserBlockSuccess | InvalidInputError | ResourceNotFoundError

  type UserBlockSuccess {
    blocker: User!
    blockee: User!
    alreadyBlocked: Boolean!
  }
`;

export const resolver: MutationResolvers["userBlock"] = async (_parent, args, context) => {
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
      message: "can't block yourself",
    };
  }

  const result = await context.db.transaction().execute(async (trx) => {
    const blockee = await context.api.user.getById(parsed, trx);

    if (!blockee) {
      return { type: "notFound" } as const;
    }

    const block = await context.api.block.create(
      { blockerId: authed.id, blockeeId: blockee.id },
      trx,
    );

    return { type: "ok", blockee, block } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "user not found",
      };
    case "ok":
      return {
        __typename: "UserBlockSuccess",
        blocker: authed,
        blockee: result.blockee,
        alreadyBlocked: !result.block,
      };
    default:
      throw new Error(result satisfies never);
  }
};
