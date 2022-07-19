import type { Resolvers } from "@/types";
import { fromNodeId } from "@/utils";
import { parsers } from "./parsers";

export const resolvers: Resolvers = {
  Query: {
    node: (_, args, { dataSources: { todoAPI, userAPI } }) => {
      const parsed = parsers.Query.node(args);

      const { type } = fromNodeId(parsed.nodeId);

      switch (type) {
        case "Todo": {
          return todoAPI.get({ nodeId: args.id });
        }
        case "User": {
          return userAPI.get({ nodeId: args.id });
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
