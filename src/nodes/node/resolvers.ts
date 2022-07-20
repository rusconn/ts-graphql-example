import type { Resolvers } from "@/types";
import { isTodoId, isUserId } from "@/utils";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    node: (_, args, { dataSources: { todoAPI, userAPI } }) => {
      const parsed = parsers.Query.node(args);

      if (isUserId(parsed.id)) {
        return userAPI.get({ id: parsed.id });
      }

      if (isTodoId(parsed.id)) {
        return todoAPI.get({ id: parsed.id });
      }

      return null;
    },
  },
  Node: {
    __resolveType: (node, { logger }) => {
      logger.debug({ node }, "node resolved");

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
