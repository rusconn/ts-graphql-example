import type { MutationResolvers } from "../../schema.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userBlock(id: ID!): UserBlockResult
  }

  union UserBlockResult = UserBlockSuccess | ResourceNotFoundError

  type UserBlockSuccess {
    blocker: User!
    alreadyBlocked: Boolean!
  }
`;

export const resolver: MutationResolvers["userBlock"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const id = parseUserId(args.id);

  if (id instanceof Error) {
    throw badUserInputErr(id.message, id);
  }
  if (authed.id === id) {
    throw badUserInputErr("Can't block oneself");
  }

  const result = await context.api.block.create({
    blockerId: authed.id,
    blockeeId: id,
  });

  switch (result.type) {
    case "Success":
      return {
        __typename: "UserBlockSuccess",
        blocker: authed,
        alreadyBlocked: false,
      };
    case "BlockAlreadyExists": {
      return {
        __typename: "UserBlockSuccess",
        blocker: authed,
        alreadyBlocked: true,
      };
    }
    case "BlockeeNotExists":
      return {
        __typename: "ResourceNotFoundError",
        message: "The specified user does not exist.",
      };
    case "Unknown":
      throw internalServerError(result.e);
    default:
      throw new Error(result satisfies never);
  }
};
