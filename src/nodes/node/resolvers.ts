import { ApolloError } from "apollo-server";

import { ErrorCode, Resolvers } from "@/types";
import * as DataSource from "@/datasources";
import { fromNodeId } from "@/utils";
import { validations } from "./validations";

export const resolvers: Resolvers = {
  Query: {
    node: async (_, args, { dataSources: { todoAPI, userAPI } }) => {
      validations.Query.node(args);

      const { type } = fromNodeId(args.id);

      try {
        switch (type) {
          case "Todo": {
            return await todoAPI.get({ nodeId: args.id });
          }
          case "User": {
            return await userAPI.get({ nodeId: args.id });
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
