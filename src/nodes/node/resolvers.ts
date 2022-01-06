import type { Resolvers } from "@/types";

export const resolvers: Resolvers = {
  Query: {
    node: async (_, { id }, { dataSources }) => {
      const apis = Object.values(dataSources);

      try {
        const nodePromises = apis.map(api => api.getRejectOnNotFound(id));
        return await Promise.any(nodePromises);
      } catch {
        return null;
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
