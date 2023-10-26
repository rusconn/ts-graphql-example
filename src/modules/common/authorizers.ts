import ExtensibleCustomError from "extensible-custom-error";

import type { ContextUser } from "./resolvers";

export class AuthorizationError extends ExtensibleCustomError {}

export const allow = (user: ContextUser) => user;

export const isAdmin = (user: ContextUser) => {
  if (user.role === "ADMIN") return user;
  throw new AuthorizationError();
};

export const isUser = (user: ContextUser) => {
  if (user.role === "USER") return user;
  throw new AuthorizationError();
};

export const isGuest = (user: ContextUser) => {
  if (user.role === "GUEST") return user;
  throw new AuthorizationError();
};

export const isAuthenticated = (user: ContextUser) => {
  if (user.role !== "GUEST") return user;
  throw new AuthorizationError();
};
