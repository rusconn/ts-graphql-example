import { GraphQLError } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";
import { decodeTime, type ulid } from "ulid";

import type { db } from "@/db/client.ts";
import type { createLoaders } from "@/db/loaders/mod.ts";
import type { UserSelect } from "@/db/models.ts";
import type { logger } from "@/logger.ts";
import { ErrorCode } from "./schema.ts";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export const dateByUlid = (id: ReturnType<typeof ulid>) => {
  return new Date(decodeTime(id));
};

export type Context = ServerContext & PluginContext & YogaInitialContext & UserContext;

export type ServerContext = {
  req: HttpRequest;
  res: HttpResponse;
};

export type PluginContext = {
  requestId?: string;
};

export type UserContext = {
  start: ReturnType<typeof Date.now>;
  logger: ReturnType<typeof logger.child>;
  db: typeof db;
  loaders: ReturnType<typeof createLoaders>;
  user: Admin | User | Guest;
};

type Admin = UserSelect & { role: "ADMIN" };
type User = UserSelect & { role: "USER" };
type Guest = null;
