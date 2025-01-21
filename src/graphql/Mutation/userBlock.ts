import type { Block } from "../../models/block.ts";
import type { User } from "../../models/user.ts";
import type { MutationResolvers } from "../../schema.ts";
import { blockCursor } from "../_adapters/block/cursor.ts";
import { authAuthenticated } from "../_authorizers/authenticated.ts";
import { badUserInputErr } from "../_errors/badUserInput.ts";
import { forbiddenErr } from "../_errors/forbidden.ts";
import { internalServerError } from "../_errors/internalServerError.ts";
import { parseUserId } from "../_parsers/user/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    userBlock(id: ID!): UserBlockResult @semanticNonNull
  }

  union UserBlockResult = UserBlockSuccess | ResourceNotFoundError

  type UserBlockSuccess {
    blockee: User!
    blockingEdge: BlockingEdge!
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
    case "Success": {
      const blockee = await context.api.user.getById(id);
      if (!blockee) throw internalServerError();
      return userBlockSuccess(blockee, result.block);
    }
    case "BlockAlreadyExists": {
      const [blockee, block] = await Promise.all([
        context.api.user.getById(id),
        context.api.block.get({ blockerId: authed.id, blockeeId: id }),
      ]);
      if (!blockee || !block) throw internalServerError();
      return userBlockSuccess(blockee, block);
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

const userBlockSuccess = (blockee: User, block: Block) => {
  return {
    __typename: "UserBlockSuccess",
    blockee,
    blockingEdge: blockingEdge(blockee, block),
  } as const;
};

const blockingEdge = (blockee: User, block: Block) => {
  const cursor = blockCursor(block);
  const blockedAt = block.createdAt;
  return { node: blockee, cursor, blockedAt };
};
