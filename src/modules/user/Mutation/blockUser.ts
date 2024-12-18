import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parseUserId } from "../parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    blockUser(id: ID!): BlockUserResult
  }

  union BlockUserResult = BlockUserSuccess | InvalidInputError | ResourceNotFoundError

  type BlockUserSuccess {
    blocker: User!
    blockee: User!
    alreadyBlocked: Boolean!
  }
`;

export const resolver: MutationResolvers["blockUser"] = async (_parent, args, context) => {
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

    const block = await context.api.user.createBlock(
      {
        blockerId: authed.id,
        blockeeId: blockee.id,
      },
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
        __typename: "BlockUserSuccess",
        blocker: authed,
        blockee: result.blockee,
        alreadyBlocked: !result.block,
      };
    default:
      throw new Error(result satisfies never);
  }
};
