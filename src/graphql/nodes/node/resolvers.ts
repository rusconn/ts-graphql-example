import { toUserNode, toTodoNode } from "@/adapters";
import type { Graph } from "@/graphql/types";
import { isTodoId, isUserId } from "@/ids";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    node: async (_, args, { dataSources: { todoAPI, userAPI } }) => {
      const parsed = parsers.Query.node(args);

      if (isUserId(parsed.id)) {
        const user = await userAPI.get({ id: parsed.id });

        return toUserNode(user);
      }

      if (isTodoId(parsed.id)) {
        const todo = await todoAPI.get({ id: parsed.id });

        return toTodoNode(todo);
      }

      return null;
    },
  },
  Node: {
    __resolveType: node => {
      if ("title" in node) {
        return "Todo";
      }

      if ("name" in node) {
        return "User";
      }

      return null;
    },
  },
};
