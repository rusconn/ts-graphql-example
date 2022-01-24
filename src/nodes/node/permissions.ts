import { chain, race, rule } from "graphql-shield";

import type { Context, QueryNodeArgs } from "@/types";
import { permissionError, isAdmin, isAuthenticated, fromNodeId } from "@/utils";

const isOwner = rule({ cache: "strict" })(
  async (_, { id: nodeId }: QueryNodeArgs, { logger, user, dataSources }: Context) => {
    logger.debug("node isOwner called");

    const { type, id } = fromNodeId(nodeId);

    switch (type) {
      case "Todo": {
        const node = await dataSources.todoAPI.get(nodeId);
        if (!node) return permissionError;
        return node.userId === user.id || permissionError;
      }
      case "User": {
        const node = await dataSources.userAPI.get(nodeId);
        if (!node) return permissionError;
        return id === user.id || permissionError;
      }
      default: {
        return false;
      }
    }
  }
);

export const permissions = {
  Query: {
    node: race(isAdmin, chain(isAuthenticated, isOwner)),
  },
};
