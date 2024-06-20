import { GraphQLError } from "graphql";

import type { Context } from "./resolvers.ts";
import { ErrorCode } from "./schema.ts";

export const authErr = () =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
  });

export const auth = (context: Pick<Context, "user">) => context.user;

export const authAdmin = (context: Pick<Context, "user">) => {
  if (context.user?.role === "ADMIN") return context.user;
  throw authErr();
};

export const authUser = (context: Pick<Context, "user">) => {
  if (context.user?.role === "USER") return context.user;
  throw authErr();
};

export const authGuest = (context: Pick<Context, "user">) => {
  if (context.user == null) return context.user;
  throw authErr();
};

export const authAuthenticated = (context: Pick<Context, "user">) => {
  if (context.user != null) return context.user;
  throw authErr();
};
