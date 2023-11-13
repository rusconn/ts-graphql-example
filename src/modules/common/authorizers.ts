import type { ContextUser } from "./resolvers.js";

export class AuthorizationError extends Error {
  override readonly name = "AuthorizationError" as const;

  constructor(message?: string, options?: { cause?: Error }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

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
