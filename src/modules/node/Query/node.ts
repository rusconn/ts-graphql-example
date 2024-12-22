import type { QueryResolvers } from "../../../schema.ts";
import { authAuthenticated } from "../../common/authorizers/authenticated.ts";
import { badUserInputErr } from "../../common/errors/badUserInput.ts";
import { forbiddenErr } from "../../common/errors/forbidden.ts";
import { parseId } from "../../common/parsers/id.ts";
import { getTodo } from "../../todo/resolvers.ts";
import { getUser } from "../../user/resolvers.ts";

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
    throw badUserInputErr(`invalid node id: ${args.id}`, parsed);
  }

  const { type, internalId } = parsed;

  const getNode = {
    Todo: getTodo,
    User: getUser,
  }[type];

  const node = await getNode(context, { id: internalId });

  return node == null ? null : { type, ...node };
};
