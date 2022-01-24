import type { Resolvers } from "@/types";
import { fromNodeId } from "@/utils";

export const resolvers: Resolvers = {
  Query: {
    node: (_, { id }, { dataSources: { todoAPI, userAPI } }) => {
      const { type } = fromNodeId(id);

      switch (type) {
        case "Todo": {
          return todoAPI.get(id);
        }
        case "User": {
          return userAPI.get(id);
        }
        default: {
          return null;
        }
      }
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
