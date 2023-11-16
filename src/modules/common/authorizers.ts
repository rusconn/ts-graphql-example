import type { ContextUser } from "./resolvers.ts";

export class AuthorizationError extends Error {
  override readonly name = "AuthorizationError" as const;

  constructor(message?: string, options?: { cause?: Error }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export const auth = (user: ContextUser) => user;

export const authAdmin = (user: ContextUser) => {
  if (user.role === "ADMIN") return user;
  throw new AuthorizationError();
};

export const authUser = (user: ContextUser) => {
  if (user.role === "USER") return user;
  throw new AuthorizationError();
};

export const authGuest = (user: ContextUser) => {
  if (user.role === "GUEST") return user;
  throw new AuthorizationError();
};

export const authAuthenticated = (user: ContextUser) => {
  if (user.role !== "GUEST") return user;
  throw new AuthorizationError();
};
