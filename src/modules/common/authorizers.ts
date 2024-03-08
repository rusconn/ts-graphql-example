import { GraphQLError } from "graphql";

import type { ContextUser } from "./resolvers.ts";
import { ErrorCode } from "./schema.ts";

export const authErr = () =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
  });

export const auth = (user: ContextUser) => user;

export const authAdmin = (user: ContextUser) => {
  if (user.role === "ADMIN") return user;
  throw authErr();
};

export const authUser = (user: ContextUser) => {
  if (user.role === "USER") return user;
  throw authErr();
};

export const authGuest = (user: ContextUser) => {
  if (user.role === "GUEST") return user;
  throw authErr();
};

export const authAuthenticated = (user: ContextUser) => {
  if (user.role !== "GUEST") return user;
  throw authErr();
};
