import type { Graph, TypeDef } from "@/graphql/types";
import parsers from "@/graphql/parsers/node";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: (_, args) => {
      return parsers.Query.node(args);
    },
  },
  Node: {
    // @ts-expect-error: type はスキーマに無いが使いたい
    __resolveType: ({ type }) => {
      return type as TypeDef.NodeType;
    },
  },
};
