import type { randomUUID } from "node:crypto";

import { GraphQLError } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import type { EmptyObject } from "type-fest";

import type { db } from "@/db/mod.ts";
import type * as DB from "@/db/mod.ts";
import { ErrorCode } from "./schema.ts";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export type Context = ServerContext & YogaInitialContext & UserContext;

export type ServerContext = EmptyObject;

export type UserContext = {
  requestId: ReturnType<typeof randomUUID>;
  db: typeof db;
  loaders: ReturnType<typeof DB.createLoaders>;
  user: Admin | User | Guest;
};

type Admin = DB.UserSelect & { role: "ADMIN" };
type User = DB.UserSelect & { role: "USER" };
type Guest = { id: undefined; role: "GUEST" };
