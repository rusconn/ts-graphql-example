import type { Todo, User } from "@prisma/client";
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import {
  CreateTodoInput,
  QueryTodosArgs,
  SortDirection,
  UpdateTodoInput,
  UserTodosArgs,
} from "@/types";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { ValidationError, NotFoundError, DataSourceError } from "./errors";

export class TodoAPI extends PrismaDataSource {
  getsUserTodos(id: User["id"], args: UserTodosArgs) {
    return this.getsByUserId({ ...args, userId: id });
  }

  async getsByUserId(args: QueryTodosArgs) {
    try {
      return await this.getsByUserIdCore(args);
    } catch (e) {
      // 多分 findManyCursorConnection のバリデーションエラー
      if (!(e instanceof DataSourceError) && e instanceof Error) {
        throw new ValidationError(e.message, e);
      }

      throw e;
    }
  }

  @catchPrismaError
  private getsByUserIdCore({ userId, order, ...paginationArgs }: QueryTodosArgs) {
    const defaultedPaginationArgs =
      paginationArgs.first == null && paginationArgs.last == null
        ? { ...paginationArgs, first: 20 }
        : paginationArgs;

    const direction = order === SortDirection.Asc ? "asc" : "desc";

    return findManyCursorConnection(
      async args => {
        // prisma の型が間違っている
        // https://github.com/prisma/prisma/issues/10687
        const todos = (await this.prisma.user.findUnique({ where: { id: userId } }).todos({
          ...args,
          orderBy: [{ createdAt: direction }, { id: direction }],
        })) as Todo[] | null;

        if (!todos) {
          throw new NotFoundError("user not found");
        }

        return todos;
      },
      () => this.prisma.todo.count({ where: { userId } }),
      defaultedPaginationArgs
    );
  }

  // get のパラメタライズだと non-null に出来ない
  @catchPrismaError
  getRejectOnNotFound(id: User["id"]) {
    return this.prisma.todo.findUnique({ where: { id }, rejectOnNotFound: true });
  }

  @catchPrismaError
  get(id: Todo["id"]) {
    return this.prisma.todo.findUnique({ where: { id } });
  }

  @catchPrismaError
  create(userId: User["id"], input: CreateTodoInput) {
    return this.prisma.todo.create({ data: { ...input, userId } });
  }

  @catchPrismaError
  update(id: Todo["id"], input: UpdateTodoInput) {
    return this.prisma.todo.update({ where: { id }, data: input });
  }

  @catchPrismaError
  delete(id: Todo["id"]) {
    return this.prisma.todo.delete({ where: { id } });
  }
}
