import { GraphQLError } from "graphql";
import { rule } from "graphql-shield";

import { Graph } from "@/graphql/types";
import type { Context } from "@/server/types";

export const isAdmin = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role === "ADMIN" || permissionError;
});

export const isUser = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role === "USER" || permissionError;
});

export const isGuest = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role === "GUEST" || permissionError;
});

export const isAuthenticated = rule({ cache: "contextual" })((_, __, { user }: Context) => {
  return user.role !== "GUEST" || permissionError;
});

// graphql-shield がデフォルトで INTERNAL_SERVER_ERROR を返してしまうので用意している
// https://github.com/maticzav/graphql-shield/issues/1176
export const permissionError = new GraphQLError("Forbidden", {
  extensions: { code: Graph.ErrorCode.Forbidden },
});