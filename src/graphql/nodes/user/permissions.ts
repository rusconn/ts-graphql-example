import { chain, race, rule } from "graphql-shield";

import { toUserNodeId } from "@/adapters";
import type { Graph } from "@/graphql/types";
import { isAdmin, isGuest, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/server/types";
import { parsers } from "./parsers";

type QueryOrUpdateOrDeleteArgs =
  | Graph.QueryUserArgs
  | Graph.MutationUpdateUserArgs
  | Graph.MutationDeleteUserArgs;

type Parent = Graph.ResolversParentTypes["User"];

const isSelf = rule({ cache: "strict" })(
  (_, args: QueryOrUpdateOrDeleteArgs, { user }: Context) => {
    const { id } = parsers.Query.user(args);

    return id === user.id || newPermissionError();
  }
);

const isOwner = rule({ cache: "strict" })(({ id }: Parent, _, { user }: Context) => {
  return id === toUserNodeId(user.id) || newPermissionError();
});

export const permissions = {
  Query: {
    viewer: isAuthenticated,
    users: isAdmin,
    user: race(isAdmin, chain(isAuthenticated, isSelf)),
  },
  Mutation: {
    createUser: race(isAdmin, isGuest),
    updateUser: race(isAdmin, chain(isAuthenticated, isSelf)),
    deleteUser: race(isAdmin, chain(isAuthenticated, isSelf)),
  },
  User: {
    token: race(isOwner, isGuest),
    role: isAdmin,
    todos: race(isAdmin, isOwner),
  },
};
