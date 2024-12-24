import * as todoId from "../../../datasources/todo/types/id.ts";
import * as userId from "../../../datasources/user/types/id.ts";
import type { QueryResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parseId } from "../../common/parsers/id.ts";

export const typeDef = /* GraphQL */ `
  extend type Query {
    node(id: ID!): Node
  }
`;

export const resolver: QueryResolvers["node"] = async (_parent, args, context) => {
  const authed = authAuthenticated(context);

  if (authed instanceof Error) {
    throw forbiddenErr(authed);
  }

  const parsed = parseId(args);

  if (parsed instanceof Error) {
    throw badUserInputErr(parsed.message, parsed);
  }

  const { type, internalId } = parsed;

  const [isInternalId, getNode] = (
    {
      Todo: [todoId.is, context.api.todo.getById],
      User: [userId.is, context.api.user.getById],
    } as const
  )[type];

  if (!isInternalId(internalId)) {
    throw badUserInputErr(`invalid node id: ${args.id}`);
  }

  // @ts-expect-error: isInternalId と getNode がペアであることを認識できない
  const node = await getNode(internalId);

  return node == null ? null : { type, ...node };
};
