import { allow, or, rule } from "graphql-shield";

import type { Graph } from "@/graphql/types";
import type { Context } from "@/graphql/types/resolvers";
import { isAdmin, isGuest, isAuthenticated, newPermissionError } from "@/graphql/utils";

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
    login: allow,
    logout: isAuthenticated,
    updateMe: isAuthenticated,
    deleteMe: isAuthenticated,
  },
  User: {
    id: or(isAdmin, isOwner),
    createdAt: or(isAdmin, isOwner),
    updatedAt: or(isAdmin, isOwner),
    name: or(isAdmin, isOwner),
    email: or(isAdmin, isOwner),
    token: or(isOwner, isGuest),
  },
};
