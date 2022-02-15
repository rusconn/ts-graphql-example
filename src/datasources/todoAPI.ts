import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import {
  CreateTodoInput,
  OrderDirection,
  QueryTodosArgs,
  Todo,
  TodoOrderField,
  UpdateTodoInput,
  User,
  UserTodosArgs,
} from "@/types";
import { mapConnectionIds, toTodoId, toTodoNodeId, toUserId } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { ValidationError, NotFoundError, DataSourceError } from "./errors";

export class TodoAPI extends PrismaDataSource {
  getsUserTodos(id: User["id"], args: UserTodosArgs, info: GraphQLResolveInfo) {
    return this.getsByUserId({ ...args, userId: id }, info);
  }

  async getsByUserId({ userId: nodeId, ...rest }: QueryTodosArgs, info: GraphQLResolveInfo) {
    const id = toUserId(nodeId);

    try {
      return await this.getsByUserIdCore(id, rest, info);
    } catch (e) {
      // 多分 findManyCursorConnection のバリデーションエラー
      if (!(e instanceof DataSourceError) && e instanceof Error) {
        throw new ValidationError(e.message, e);
      }

      throw e;
    }
  }

  @catchPrismaError
  private async getsByUserIdCore(
    userId: Prisma.User["id"],
    { orderBy, ...paginationArgs }: Omit<QueryTodosArgs, "userId">,
    info: GraphQLResolveInfo
  ) {
    const defaultedPaginationArgs =
      paginationArgs.first == null && paginationArgs.last == null
        ? { ...paginationArgs, first: 20 }
        : paginationArgs;

    const { field, direction } = orderBy ?? {};
    const directionToUse = direction === OrderDirection.Asc ? "asc" : "desc";

    const result = await findManyCursorConnection<Prisma.Todo, Pick<Prisma.Todo, "id">>(
      async args => {
        // prisma の型が間違っている
        // https://github.com/prisma/prisma/issues/10687
        const todos = (await this.prisma.user.findUnique({ where: { id: userId } }).todos({
          ...args,
          orderBy:
            field === TodoOrderField.CreatedAt
              ? { id: directionToUse }
              : [{ updatedAt: directionToUse }, { id: directionToUse }],
        })) as Prisma.Todo[] | null;

        if (!todos) {
          throw new NotFoundError("user not found");
        }

        return todos;
      },
      () => this.prisma.todo.count({ where: { userId } }),
      defaultedPaginationArgs,
      {
        getCursor: record => ({ id: record.id }),
        encodeCursor: ({ id }) => toTodoNodeId(id),
        decodeCursor: cursor => ({ id: toTodoId(cursor) }),
        resolveInfo: info,
      }
    );

    return mapConnectionIds(result, toTodoNodeId);
  }

  @catchPrismaError
  async get(nodeId: Todo["id"]) {
    const id = toTodoId(nodeId);
    const result = await this.prisma.todo.findUnique({ where: { id } });

    if (!result) {
      throw new NotFoundError("Not found");
    }

    return { ...result, id: toTodoNodeId(result.id) };
  }

  @catchPrismaError
  async create(nodeId: User["id"], input: CreateTodoInput) {
    const id = toUserId(nodeId);
    const result = await this.prisma.todo.create({ data: { ...input, userId: id } });
    return { ...result, id: toTodoNodeId(result.id) };
  }

  @catchPrismaError
  async update(nodeId: Todo["id"], { title, description, status }: UpdateTodoInput) {
    const id = toTodoId(nodeId);

    const result = await this.prisma.todo.update({
      where: { id },
      data: {
        title: title ?? undefined,
        description: description ?? undefined,
        status: status ?? undefined,
      },
    });

    return { ...result, id: toTodoNodeId(result.id) };
  }

  @catchPrismaError
  async delete(nodeId: Todo["id"]) {
    const id = toTodoId(nodeId);
    const result = await this.prisma.todo.delete({ where: { id } });
    return { ...result, id: toTodoNodeId(result.id) };
  }
}
