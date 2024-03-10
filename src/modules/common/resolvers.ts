import { GraphQLError } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import type { Logger } from "pino";

import type * as Prisma from "@/prisma/mod.ts";
import { ErrorCode } from "./schema";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export type Context = YogaInitialContext & ServerContext & UserContext;

export type ServerContext = Record<string, never>;

export type UserContext = {
  prisma: typeof Prisma.prisma;
  user: ContextUser;
  logger: Logger;
};

export type ContextUser = Admin | User | Guest;

export type Admin = Prisma.User & { role: "ADMIN" };
export type User = Prisma.User & { role: "USER" };
export type Guest = Pick<Prisma.User, "id"> & { role: "GUEST" };

export type Key<T extends object> = { __type: "key" } & T;
export type Full<T extends object> = { __type: "full" } & T;

export const key = <T extends object>(data: T): Key<T> => {
  return { __type: "key", ...data };
};

export const full = <T extends object>(data: T): Full<T> => {
  return { __type: "full", ...data };
};

export const isFull = <T extends Key<object>, U extends Full<object>>(data: T | U): data is U => {
  return data.__type === "full";
};
