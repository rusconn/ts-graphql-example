import { chain, race, rule } from "graphql-shield";

import type { Graph } from "@/graphql/types";
import { isAdmin, isGuest, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";
import { parsers } from "./parsers";
import { toUserNodeId } from "./adapters";

type UpdateOrDeleteArgs = Graph.MutationUpdateUserArgs | Graph.MutationDeleteUserArgs;

type Parent = Graph.ResolversParentTypes["User"];

const isSelf = rule({ cache: "strict" })((_, args: UpdateOrDeleteArgs, { user }: Context) => {
  const { id } = parsers.Query.user(args);

  return id === user.id || newPermissionError();
});

const isOwner = rule({ cache: "strict" })(({ id }: Parent, _, { user }: Context) => {
  return id === toUserNodeId(user.id) || newPermissionError();
});

export const permissions = {
  Query: {
    me: isAuthenticated,
    users: isAdmin,
    user: isAdmin,
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
