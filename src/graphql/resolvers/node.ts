import * as DataSource from "@/datasources";
import type { Graph, TypeDef } from "@/graphql/types";
import parsers from "@/graphql/parsers/node";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: async (_, args, { user }) => {
      const { type, id } = parsers.Query.node(args);

      switch (type) {
        case "Todo": {
          return { type, id, userId: user.id };
        }
        case "User": {
          if (id !== user.id) {
            throw new DataSource.NotFoundError();
          }

          return { type, id };
        }
      }
    },
  },
  Node: {
    // @ts-expect-error: type はスキーマに無いが使いたい
    __resolveType: ({ type }) => {
      return type as TypeDef.NodeType;
    },
  },
};
