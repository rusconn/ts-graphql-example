import { GraphQLError } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import type { EmptyObject } from "type-fest";
import { decodeTime, type ulid } from "ulid";

import type { db } from "@/db/client.ts";
import type { createLoaders } from "@/db/loaders/mod.ts";
import type { UserSelect } from "@/db/models.ts";
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
  loaders: ReturnType<typeof createLoaders>;
  user: Admin | User | Guest;
};

type Admin = UserSelect & { role: "ADMIN" };
type User = UserSelect & { role: "USER" };
type Guest = null;
