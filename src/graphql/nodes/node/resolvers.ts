import { toUserNode, toTodoNode, splitNodeId } from "@/adapters";
import type { Graph } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: async (_, args, { dataSources: { todoAPI, userAPI } }) => {
      const { type, id } = parsers.Query.node(args);

      switch (type) {
        case "Todo": {
          const todo = await todoAPI.get({ id });

          return toTodoNode(todo);
        }
        case "User": {
          const user = await userAPI.get({ id });

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
