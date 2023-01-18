import { chain, race, rule } from "graphql-shield";

import type { Graph } from "@/graphql/types";
import { isAdmin, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";
import { parsers } from "./parsers";

const isOwner = rule({ cache: "strict" })(
  async (_, args: Graph.QueryNodeArgs, { user, dataSources }: Context) => {
    const { type, id } = parsers.Query.node(args);

    switch (type) {
      case "Todo": {
        const todo = await dataSources.todoAPI.get({ id });

        return todo.userId === user.id || newPermissionError();
      }
      case "User": {
        return id === user.id || newPermissionError();
      }
    }
  }
);

export const permissions = {
  Query: {
    node: race(isAdmin, chain(isAuthenticated, isOwner)),
  },
};
