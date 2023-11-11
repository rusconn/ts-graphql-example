import type * as Graph from "../common/schema";
import type { NodeType } from "../common/typeDefs";
import { authorizers } from "./authorizers";
import { parsers } from "./parsers";

export type Node = { type: NodeType; id: string };

export const resolvers: Graph.Resolvers = {
  Query: {
    node: (_, args, { user }) => {
      authorizers.Query.node(user);

      const { type, id } = parsers.Query.node(args);

      return { type, id };
    },
  },
  Node: {
    __resolveType: ({ type }) => {
      return type;
    },
  },
};
