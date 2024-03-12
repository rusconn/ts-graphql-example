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

export type Admin = Pick<Prisma.User, "id"> & { role: "ADMIN" };
export type User = Pick<Prisma.User, "id"> & { role: "USER" };
export type Guest = Pick<Prisma.User, "id"> & { role: "GUEST" };
