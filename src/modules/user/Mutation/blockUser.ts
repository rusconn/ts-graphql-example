import type { MutationResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers.ts";
import { parseErr } from "../../common/parsers.ts";
import { userNodeId } from "../common/adapter.ts";
import { parseUserNodeId } from "../common/parser.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    blockUser(id: ID!): BlockUserResult
  }

  union BlockUserResult = BlockUserSuccess | ResourceNotFoundError

  type BlockUserSuccess {
    id: ID!
  }
`;

export const resolver: MutationResolvers["blockUser"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  const id = parseUserNodeId(args.id);

  if (authed.id === id) {
    throw parseErr("can't block yourself");
  }

  const blockee = await context.db
    .selectFrom("User")
    .where("id", "=", id)
    .select("id")
    .executeTakeFirst();

  if (!blockee) {
    return {
      __typename: "ResourceNotFoundError",
      message: "user not found",
    };
  }

  const result = await context.db
    .insertInto("BlockerBlockee")
    .values({
      blockerId: authed.id,
      blockeeId: id,
    })
    .onConflict((oc) => oc.doNothing())
    .returning("blockeeId")
    .executeTakeFirstOrThrow();

  return {
    __typename: "BlockUserSuccess",
    id: userNodeId(result.blockeeId),
  };
};
