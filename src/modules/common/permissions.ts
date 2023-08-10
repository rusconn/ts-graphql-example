import { GraphQLError } from "graphql";
import { rule } from "graphql-shield";

import * as Graph from "./schema";
import type { Context } from "./resolvers";

export const isAdmin = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role === "ADMIN" || newPermissionError();
});

export const isUser = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role === "USER" || newPermissionError();
});

export const isGuest = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role === "GUEST" || newPermissionError();
});

export const isAuthenticated = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role !== "GUEST" || newPermissionError();
});

// graphql-shield がデフォルトで INTERNAL_SERVER_ERROR を返してしまうので用意している
// https://github.com/maticzav/graphql-shield/issues/1176
export const newPermissionError = () =>
  new GraphQLError("Forbidden", {
    extensions: { code: Graph.ErrorCode.Forbidden },
  });
