import { randomUUID } from "node:crypto";

import { GraphQLError } from "graphql";
import type { YogaInitialContext } from "graphql-yoga";
import type { EmptyObject } from "type-fest";

import type * as Prisma from "@/prisma/mod.ts";
import { ErrorCode } from "./schema.ts";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export type Context = ServerContext & YogaInitialContext & UserContext;

export type ServerContext = EmptyObject;

export type UserContext = {
  requestId: ReturnType<typeof randomUUID>;
  prisma: typeof Prisma.prisma;
  user: Admin | User | Guest;
};

type Admin = Prisma.User & { role: "ADMIN" };
type User = Prisma.User & { role: "USER" };
type Guest = { id: undefined; role: "GUEST" };
