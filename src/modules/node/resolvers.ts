import type * as Graph from "../common/schema";
import type { NodeType } from "../common/typeDefs";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: (_, args) => {
      const { type, id } = parsers.Query.node(args);

      return { type, id };
    },
  },
  Node: {
    // @ts-expect-error: type はスキーマに無いが使いたい
    __resolveType: ({ type }) => {
      return type as NodeType;
    },
  },
};
