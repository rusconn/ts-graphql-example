import * as DataSource from "@/datasources";
import type { Graph } from "@/graphql/types";
import { splitNodeId, toTodoNode, toUserNode } from "@/graphql/adapters";
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

          return toTodoNode(todo);
        }
        case "User": {
          if (id !== contextUser.id) {
            throw new DataSource.NotFoundError();
          }

          const user = await prisma.user.findUniqueOrThrow({ where: { id } });

          return toUserNode(user);
        }
      }
    },
  },
  Node: {
    __resolveType: ({ id }) => {
      return splitNodeId(id).type;
    },
  },
};
