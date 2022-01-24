import type * as Prisma from "@prisma/client";
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import { CreateUserInput, QueryUsersArgs, SortDirection, UpdateUserInput, User } from "@/types";
import { toUserNodeId, toUserId, mapConnectionIds } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { DataSourceError, ValidationError } from "./errors";

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
  private async getsCore({ order, ...paginationArgs }: QueryUsersArgs) {
    const defaultedPaginationArgs =
      paginationArgs.first == null && paginationArgs.last == null
        ? { ...paginationArgs, first: 10 }
        : paginationArgs;

    const direction = order === SortDirection.Asc ? "asc" : "desc";

    const result = await findManyCursorConnection<Prisma.User, Pick<Prisma.User, "id">>(
      args =>
        this.prisma.user.findMany({
          ...args,
          orderBy: [{ id: direction }],
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
    return result && { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async create(input: CreateUserInput) {
    const result = await this.prisma.user.create({ data: input });
    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async update(nodeId: User["id"], input: UpdateUserInput) {
    const id = toUserId(nodeId);
    const result = await this.prisma.user.update({ where: { id }, data: input });
    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async delete(nodeId: User["id"]) {
    const id = toUserId(nodeId);
    const result = await this.prisma.user.delete({ where: { id } });
    return { ...result, id: toUserNodeId(result.id) };
  }
}
