import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { forbiddenErr } from "../../common/resolvers.ts";
import { parseUserNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    unblockUser(id: ID!): UnblockUserResult
  }

  union UnblockUserResult = UnblockUserSuccess | InvalidInputError | ResourceNotFoundError

  type UnblockUserSuccess {
    unblocker: User!
    unblockee: User!
    alreadyUnblocked: Boolean!
  }
`;

export const resolver: MutationResolvers["unblockUser"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseUserNodeId(args.id);

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
    const unblockee = await trx
      .selectFrom("User")
      .where("id", "=", parsed)
      .selectAll()
      .forUpdate()
      .executeTakeFirst();

    if (!unblockee) {
      return { type: "notFound" } as const;
    }

    const unblock = await trx
      .deleteFrom("BlockerBlockee")
      .where("blockerId", "=", authed.id)
      .where("blockeeId", "=", unblockee.id)
      .returning("blockeeId")
      .executeTakeFirst();

    return { type: "ok", unblockee, unblock } as const;
  });

  switch (result.type) {
    case "notFound":
      return {
        __typename: "ResourceNotFoundError",
        message: "user not found",
      };
    case "ok":
      return {
        __typename: "UnblockUserSuccess",
        unblocker: authed,
        unblockee: result.unblockee,
        alreadyUnblocked: !result.unblock,
      };
    default:
      throw new Error(result satisfies never);
  }
};
