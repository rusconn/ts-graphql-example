import type * as Prisma from "@prisma/client";
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import {
  CreateUserInput,
  OrderDirection,
  QueryUsersArgs,
  UpdateUserInput,
  User,
  UserOrderField,
} from "@/types";
import { toUserNodeId, toUserId, mapConnectionIds } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { DataSourceError, NotFoundError, ValidationError } from "./errors";

export class UserAPI extends PrismaDataSource {
  async gets(args: QueryUsersArgs) {
    try {
      return await this.getsCore(args);
    } catch (e) {
      // 多分 findManyCursorConnection のバリデーションエラー
      if (!(e instanceof DataSourceError) && e instanceof Error) {
        throw new ValidationError(e.message, e);
      }

      throw e;
    }
  }

  @catchPrismaError
  private async getsCore({ orderBy, ...paginationArgs }: QueryUsersArgs) {
    const defaultedPaginationArgs =
      paginationArgs.first == null && paginationArgs.last == null
        ? { ...paginationArgs, first: 10 }
        : paginationArgs;

    const { field, direction } = orderBy ?? {};
    const directionToUse = direction === OrderDirection.Asc ? "asc" : "desc";

    const result = await findManyCursorConnection<Prisma.User, Pick<Prisma.User, "id">>(
      args =>
        this.prisma.user.findMany({
          ...args,
          orderBy:
            field === UserOrderField.UpdatedAt
              ? [{ updatedAt: directionToUse }, { id: directionToUse }]
              : { id: directionToUse },
        }),
      () => this.prisma.user.count(),
      defaultedPaginationArgs,
      {
        getCursor: record => ({ id: record.id }),
        encodeCursor: ({ id }) => toUserNodeId(id),
        decodeCursor: cursor => ({ id: toUserId(cursor) }),
      }
    );

    return mapConnectionIds(result, toUserNodeId);
  }

  @catchPrismaError
  get(nodeId: User["id"]) {
    const id = toUserId(nodeId);
    return this.getByDbId(id);
  }

  @catchPrismaError
  async getByDbId(id: Prisma.User["id"]) {
    const result = await this.prisma.user.findUnique({ where: { id } });

    if (!result) {
      throw new NotFoundError("Not found");
    }

    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async create(input: CreateUserInput) {
    const result = await this.prisma.user.create({ data: input });
    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async update(nodeId: User["id"], { name }: UpdateUserInput) {
    const id = toUserId(nodeId);

    const result = await this.prisma.user.update({
      where: { id },
      data: { name: name ?? undefined },
    });

    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async delete(nodeId: User["id"]) {
    const id = toUserId(nodeId);
    const result = await this.prisma.user.delete({ where: { id } });
    return { ...result, id: toUserNodeId(result.id) };
  }
}
