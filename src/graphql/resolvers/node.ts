import * as DataSource from "@/datasources";
import type { Graph, TypeDef } from "@/graphql/types";
import parsers from "@/graphql/parsers/node";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: async (_, args, { dataSources: { prisma }, user: contextUser }) => {
      const { type, id } = parsers.Query.node(args);

      switch (type) {
        case "Todo": {
          const todo = await prisma.todo.findUniqueOrThrow({
            where: { id, userId: contextUser.id },
          });

          return { type, ...todo };
        }
        case "User": {
          if (id !== contextUser.id) {
            throw new DataSource.NotFoundError();
          }

          const user = await prisma.user.findUniqueOrThrow({
            where: { id },
          });

          return { type, ...user };
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
