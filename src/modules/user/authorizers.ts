import type * as Graph from "../common/schema";
import {
  isAdmin,
  isGuest,
  isAuthenticated,
  allow,
  AuthorizationError,
} from "../common/authorizers";
import type { ContextUser } from "../common/resolvers";

type ParentUserId = Graph.ResolversParentTypes["User"]["id"];

const isUserOwner = (user: ContextUser, id: ParentUserId) => {
  if (user.id === id) return user;
  throw new AuthorizationError();
};

const isAdminOrUserOwner = (user: ContextUser, id: ParentUserId) => {
  try {
    return isAdmin(user);
  } catch {
    return isUserOwner(user, id);
  }
};

export const authorizers = {
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
    id: isAdminOrUserOwner,
    createdAt: isAdminOrUserOwner,
    updatedAt: isAdminOrUserOwner,
    name: isAdminOrUserOwner,
    email: isAdminOrUserOwner,
    token: isUserOwner,
  },
};
