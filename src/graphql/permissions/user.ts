import { or, rule } from "graphql-shield";

import type { Graph } from "@/graphql/types";
import { isAdmin, isGuest, isAuthenticated, newPermissionError } from "@/graphql/utils";
import type { Context } from "@/types";

type Parent = Graph.ResolversParentTypes["User"];

const isOwner = rule({ cache: "strict" })(({ id }: Parent, _, { user }: Context) => {
  return id === user.id || newPermissionError();
});

export default {
  Query: {
    me: isAuthenticated,
    users: isAdmin,
    user: isAdmin,
  },
  Mutation: {
    signup: isGuest,
    logout: isAuthenticated,
    updateMe: isAuthenticated,
    deleteMe: isAuthenticated,
  },
  User: {
    name: or(isAdmin, isOwner),
    email: or(isAdmin, isOwner),
    token: or(isOwner, isGuest),
  },
};
