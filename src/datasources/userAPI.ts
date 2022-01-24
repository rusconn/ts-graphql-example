import type { User } from "@prisma/client";
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import { CreateUserInput, QueryUsersArgs, SortDirection, UpdateUserInput } from "@/types";
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
  private getsCore({ order, ...paginationArgs }: QueryUsersArgs) {
    const defaultedPaginationArgs =
      paginationArgs.first == null && paginationArgs.last == null
        ? { ...paginationArgs, first: 10 }
        : paginationArgs;

    const direction = order === SortDirection.Asc ? "asc" : "desc";

    return findManyCursorConnection(
      args =>
        this.prisma.user.findMany({
          ...args,
          orderBy: [{ createdAt: direction }, { id: direction }],
        }),
      () => this.prisma.user.count(),
      defaultedPaginationArgs
    );
  }

  // get のパラメタライズだと non-null に出来ない
  @catchPrismaError
  getRejectOnNotFound(id: User["id"]) {
    return this.prisma.user.findUnique({ where: { id }, rejectOnNotFound: true });
  }

  @catchPrismaError
  get(id: User["id"]) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  @catchPrismaError
  create(input: CreateUserInput) {
    return this.prisma.user.create({ data: input });
  }

  @catchPrismaError
  update(id: User["id"], input: UpdateUserInput) {
    return this.prisma.user.update({ where: { id }, data: input });
  }

  @catchPrismaError
  delete(id: User["id"]) {
    return this.prisma.user.delete({ where: { id } });
  }
}
