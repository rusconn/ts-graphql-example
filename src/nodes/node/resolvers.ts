import { ApolloError } from "apollo-server";

import { ErrorCode, Resolvers } from "@/types";
import * as DataSource from "@/datasources";
import { fromNodeId } from "@/utils";

export const resolvers: Resolvers = {
  Query: {
    node: async (_, { id }, { dataSources: { todoAPI, userAPI } }) => {
      const { type } = fromNodeId(id);

      try {
        switch (type) {
          case "Todo": {
            return await todoAPI.get({ nodeId: id });
          }
          case "User": {
            return await userAPI.get({ nodeId: id });
          }
          default: {
            return null;
          }
        }
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          throw new ApolloError("Not found", ErrorCode.NotFound, { thrown: e });
        }

        throw e;
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
