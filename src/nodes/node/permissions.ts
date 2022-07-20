import { chain, race, rule } from "graphql-shield";

import type { Context, QueryNodeArgs } from "@/types";
import * as DataSource from "@/datasources";
import { permissionError, isAdmin, isAuthenticated, fromId } from "@/utils";

const isOwner = rule({ cache: "strict" })(
  async (_, { id }: QueryNodeArgs, { logger, user, dataSources }: Context) => {
    logger.debug("node isOwner called");

    const { type } = fromId(id);

    try {
      switch (type) {
        case "Todo": {
          const node = await dataSources.todoAPI.get({ id });
          return node.userId === user.id || permissionError;
        }
        case "User": {
          return id === user.id || permissionError;
        }
        default: {
          return false;
        }
      }
    } catch (e) {
      if (e instanceof DataSource.NotFoundError) {
        return false;
      }

      throw e;
    }
  }
);

export const permissions = {
  Query: {
    node: race(isAdmin, chain(isAuthenticated, isOwner)),
  },
};
