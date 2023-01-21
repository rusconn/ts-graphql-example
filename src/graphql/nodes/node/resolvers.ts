import type { Graph } from "@/graphql/types";
import { splitNodeId, toTodoNode, toUserNode } from "@/graphql/adapters";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: async (_, args, { dataSources: { todoAPI, userAPI }, user: contextUser }) => {
      const { type, id } = parsers.Query.node(args);

      switch (type) {
        case "Todo": {
          const todo = await todoAPI.get({ id, userId: contextUser.id });

          return toTodoNode(todo);
        }
        case "User": {
          const user = await userAPI.get({ id, userId: contextUser.id });

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
