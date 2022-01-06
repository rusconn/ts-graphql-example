import { chain, race, rule } from "graphql-shield";

import type { Context, QueryNodeArgs } from "@/types";
import { permissionError, isAdmin, isAuthenticated } from "@/utils";

const isOwner = rule({ cache: "strict" })(
  async (_, { id }: QueryNodeArgs, { logger, user, dataSources }: Context) => {
    logger.debug("node isOwner called");

    const apis = Object.values(dataSources);

    let node;

    try {
      const nodePromises = apis.map(api => api.getRejectOnNotFound(id));
      node = await Promise.any(nodePromises);
    } catch {
      return permissionError;
    }

    if ("title" in node) {
      return node.userId === user.id || permissionError;
    }

    if ("name" in node) {
      return node.id === user.id || permissionError;
    }

    return permissionError;
  }
);

export const permissions = {
  Query: {
    node: race(isAdmin, chain(isAuthenticated, isOwner)),
  },
};
