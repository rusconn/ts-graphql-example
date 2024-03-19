import { GraphQLError, type GraphQLResolveInfo } from "graphql";
import getFieldNames from "graphql-list-fields";
import type { YogaInitialContext } from "graphql-yoga";
import type { EmptyObject } from "type-fest";

import type { createLogger } from "@/logger.ts";
import type * as Prisma from "@/prisma/mod.ts";
import type * as Graph from "../common/schema.ts";
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

export const selectColumns =
  <T extends GraphModel, U extends PrismaModel, V extends keyof U>(
    fieldColumnMap: Partial<Record<keyof T, keyof U>>,
    requiredColumns: readonly V[],
  ) =>
  (info?: GraphQLResolveInfo, cursorConnections?: true) => {
    if (!info) {
      return undefined;
    }

    const select = {} as Partial<Record<keyof U, true>> & Record<V, true>;

    const fieldColumnMapToUse: typeof fieldColumnMap = {
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      ...fieldColumnMap,
    };

    const [modifyFieldName, depth] = cursorConnections
      ? [(name: string) => name.replace("edges.node.", "").replace("nodes.", ""), 3]
      : [(name: string) => name, 1];

    // @ts-expect-error: @types の型定義が古い
    const columns = getFieldNames(info, depth)
      .map(modifyFieldName)
      .map(field => fieldColumnMapToUse[field as keyof T])
      .filter(Boolean);

    for (const column of columns) {
      // @ts-expect-error: 解消できなかった💦
      select[column] = true;
    }

    for (const column of requiredColumns) {
      // @ts-expect-error: 解消できなかった💦
      select[column] = true;
    }

    return select;
  };

type GraphModel = Graph.Todo | Graph.User;
type PrismaModel = Prisma.Todo | Prisma.User;
