import { chain, race, rule } from "graphql-shield";

import type { Context, QueryNodeArgs } from "@/types";
import * as DataSource from "@/datasources";
import { permissionError, isAdmin, isAuthenticated, isUserId, isTodoId } from "@/utils";

const isOwner = rule({ cache: "strict" })(
  async (_, { id }: QueryNodeArgs, { user, dataSources }: Context) => {
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
