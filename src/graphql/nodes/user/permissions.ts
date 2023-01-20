import { race, rule } from "graphql-shield";

import type { Graph } from "@/graphql/types";
import { isAdmin, isGuest, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";
import { toUserNodeId } from "./adapters";

type Parent = Graph.ResolversParentTypes["User"];

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
    signup: isGuest,
    updateMe: isAuthenticated,
    deleteMe: isAuthenticated,
  },
  User: {
    token: race(isOwner, isGuest),
    todos: race(isAdmin, isOwner),
  },
};
