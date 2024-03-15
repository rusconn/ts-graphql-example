import { GraphQLError } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import type { EmptyObject } from "type-fest";

import type { createLogger } from "@/logger.ts";
import type * as Prisma from "@/prisma/mod.ts";
import { ErrorCode } from "./schema.ts";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export type Context = ServerContext & YogaInitialContext & UserContext;

export type ServerContext = EmptyObject;

export type UserContext = {
  prisma: typeof Prisma.prisma;
  user: Admin | User | Guest;
  logger: ReturnType<typeof createLogger>;
};

type Admin = Prisma.User & { role: "ADMIN" };
type User = Prisma.User & { role: "USER" };
type Guest = { id: undefined; role: "GUEST" };
