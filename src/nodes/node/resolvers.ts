import { toSchemaUser, toSchemaTodo } from "@/adapters";
import type { Resolvers } from "@/types";
import { isTodoId, isUserId } from "@/utils";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    node: async (_, args, { dataSources: { todoAPI, userAPI } }) => {
      const parsed = parsers.Query.node(args);

      if (isUserId(parsed.id)) {
        const user = await userAPI.get({ id: parsed.id });

        return toSchemaUser(user);
      }

      if (isTodoId(parsed.id)) {
        const todo = await todoAPI.get({ id: parsed.id });

        return toSchemaTodo(todo);
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
