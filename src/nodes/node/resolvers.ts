import type { Resolvers } from "@/types";
import { fromId } from "@/utils";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    node: (_, args, { dataSources: { todoAPI, userAPI } }) => {
      const parsed = parsers.Query.node(args);

      const { type } = fromId(parsed.id);

      switch (type) {
        case "Todo": {
          return todoAPI.get({ id: parsed.id });
        }
        case "User": {
          return userAPI.get({ id: parsed.id });
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
