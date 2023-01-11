import { chain, race, rule } from "graphql-shield";

import * as DataSource from "@/datasources";
import type { Graph } from "@/graphql/types";
import { permissionError, isAdmin, isAuthenticated } from "@/graphql/utils";
import { isUserId, isTodoId } from "@/ids";
import type { Context } from "@/server/types";

const isOwner = rule({ cache: "strict" })(
  async (_, { id }: Graph.QueryNodeArgs, { user, dataSources }: Context) => {
    try {
      if (isUserId(id)) {
        return id === user.id || permissionError;
      }

      if (isTodoId(id)) {
        const todo = await dataSources.todoAPI.get({ id });
        return todo.userId === user.id || permissionError;
      }
    } catch (e) {
      if (e instanceof DataSource.NotFoundError) {
        return false;
      }

      throw e;
    }

    return false;
  }
);

export const permissions = {
  Query: {
    node: race(isAdmin, chain(isAuthenticated, isOwner)),
  },
};
