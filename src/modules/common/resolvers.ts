import { GraphQLError } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import type { EmptyObject } from "type-fest";
import { decodeTime, type ulid } from "ulid";

import type { db } from "@/db/mod.ts";
import type * as DB from "@/db/mod.ts";
import { ErrorCode } from "./schema.ts";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export const dateByUlid = (id: ReturnType<typeof ulid>) => {
  return new Date(decodeTime(id));
};

export type Context = ServerContext & YogaInitialContext & UserContext;

export type ServerContext = EmptyObject;

export type UserContext = {
  requestId: ReturnType<typeof crypto.randomUUID>;
  db: typeof db;
  loaders: ReturnType<typeof DB.createLoaders>;
  user: Admin | User | Guest;
};

type Admin = DB.UserSelect & { role: "ADMIN" };
type User = DB.UserSelect & { role: "USER" };
type Guest = null;
