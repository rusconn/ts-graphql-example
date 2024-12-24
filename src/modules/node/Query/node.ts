import * as todoId from "../../../db/models/todo/id.ts";
import * as userId from "../../../db/models/user/id.ts";
import type { QueryResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parseId } from "../../common/parsers/id.ts";
import * as todo from "../../todo/node.ts";
import * as user from "../../user/node.ts";

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

  const pairs = {
    Todo: [todoId.is, todo.getNode],
    User: [userId.is, user.getNode],
  } as const;

  const [isInternalId, getNode] = pairs[type];

  if (!isInternalId(internalId)) {
    throw badUserInputErr(`invalid node id: ${args.id}`);
  }

  // @ts-expect-error: 分岐を書くのが面倒だったので…
  const node = await getNode(context, internalId);

  return node == null ? null : { type, ...node };
};
