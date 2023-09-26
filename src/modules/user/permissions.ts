import { allow, or, rule } from "graphql-shield";

import type * as Graph from "../common/schema";
import type { Context } from "../common/resolvers";
import { isAdmin, isGuest, isAuthenticated, forbiddenError } from "../common/permissions";

type Parent = Graph.ResolversParentTypes["User"];

const isOwner = rule({ cache: "strict" })(({ id }: Parent, _, { user }: Context) => {
  return id === user.id || forbiddenError();
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
    token: or(isGuest, isOwner),
  },
};
