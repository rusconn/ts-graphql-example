import type { MutationResolvers } from "../../schema.ts";
import { userId } from "../_adapters/user/id.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userUnblock(id: ID!): UserUnblockResult @semanticNonNull
  }

  union UserUnblockResult = UserUnblockSuccess

  type UserUnblockSuccess {
    userId: ID!
  }
`;

export const resolver: MutationResolvers["userUnblock"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseUserId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }
  if (authed.id === id) {
    throw badUserInputErr("Can't unblock oneself");
  }

  const _block = await context.api.block.delete({
    blockerId: authed.id,
    blockeeId: id,
  });

  return {
    __typename: "UserUnblockSuccess",
    userId: userId(id),
  };
};
