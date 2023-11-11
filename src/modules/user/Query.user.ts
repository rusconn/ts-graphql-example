import { isAdmin } from "../common/authorizers";
import type { QueryResolvers, QueryUserArgs } from "../common/schema";
import { parseUserNodeId } from "./common/parser";

export const typeDef = /* GraphQL */ `
  extend type Query {
    user(id: ID!): User
  }
`;

export const resolver: QueryResolvers["user"] = (_parent, args, context) => {
  authorizer(context.user);

  const { id } = parser(args);

  return { id };
};

export const authorizer = isAdmin;

export const parser = (args: QueryUserArgs) => {
  return { id: parseUserNodeId(args.id) };
};
