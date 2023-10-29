import type { Logger } from "pino";
import type { YogaInitialContext } from "graphql-yoga";

import type * as Prisma from "@/prisma";

export type Context = YogaInitialContext & ServerContext & UserContext;

export type ServerContext = Record<string, never>;

export type UserContext = {
  prisma: Prisma.PrismaClient;
  user: ContextUser;
  logger: Logger;
};

export type ContextUser = Admin | User | Guest;

export type Admin = Prisma.User & { role: "ADMIN" };
export type User = Prisma.User & { role: "USER" };
export type Guest = Pick<Prisma.User, "id"> & { role: "GUEST" };

export type Full<T> = { __full: true } & T;

export const full = <T extends FullModel>(data: T): Full<T> => {
  return { __full: true, ...data };
};

export const isFull = <T, U extends Full<FullModel>>(data: T | U): data is U => {
  return "__full" in data;
};

type FullModel = Prisma.Todo | Prisma.User;
