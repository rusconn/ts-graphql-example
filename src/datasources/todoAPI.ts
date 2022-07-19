import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import type { Todo, User } from "@/types";
import { mapConnectionIds, toTodoId, toTodoNodeId, toUserId } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { NotFoundError } from "./errors";

export type GetUserTodosParams = ConnectionArguments & {
  nodeId: User["id"];
  orderBy: Exclude<Prisma.Prisma.TodoFindManyArgs["orderBy"], undefined>;
  info: GraphQLResolveInfo;
};

export type GetTodoParams = {
  nodeId: Todo["id"];
};

export type CreateTodoParams = {
  nodeId: User["id"];
  title: Todo["title"];
  description: Todo["description"];
};

export type UpdateTodoParams = {
  nodeId: Todo["id"];
  title?: Todo["title"];
  description?: Todo["description"];
  status?: Todo["status"];
};

export type DeleteTodoParams = {
  nodeId: Todo["id"];
};

export class TodoAPI extends PrismaDataSource {
  @catchPrismaError
  async getsUserTodos({ nodeId, info, orderBy, ...paginationArgs }: GetUserTodosParams) {
    const userPromise = this.prisma.user.findUnique({
      where: { id: toUserId(nodeId) },
    });

    const result = await findManyCursorConnection<Prisma.Todo, Pick<Prisma.Todo, "id">>(
      async args => {
        // prisma の型が間違っている
        // https://github.com/prisma/prisma/issues/10687
        const todos = (await userPromise.todos({ ...args, orderBy })) as Prisma.Todo[] | null;

        if (!todos) {
          throw new NotFoundError("user not found");
        }

        return todos;
      },
      async () => {
        const todos = (await userPromise.todos()) as Prisma.Todo[] | null;

        if (!todos) {
          throw new NotFoundError("user not found");
        }

        return todos.length;
      },
      paginationArgs,
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
  async get({ nodeId }: GetTodoParams) {
    const id = toTodoId(nodeId);
    const result = await this.prisma.todo.findUnique({ where: { id } });

    if (!result) {
      throw new NotFoundError("Not found");
    }

    return { ...result, id: toTodoNodeId(result.id) };
  }

  @catchPrismaError
  async create({ nodeId, ...data }: CreateTodoParams) {
    const id = toUserId(nodeId);
    const result = await this.prisma.todo.create({ data: { ...data, userId: id } });
    return { ...result, id: toTodoNodeId(result.id) };
  }

  @catchPrismaError
  async update({ nodeId, ...data }: UpdateTodoParams) {
    const id = toTodoId(nodeId);

    const result = await this.prisma.todo.update({
      where: { id },
      data,
    });

    return { ...result, id: toTodoNodeId(result.id) };
  }

  @catchPrismaError
  async delete({ nodeId }: DeleteTodoParams) {
    const id = toTodoId(nodeId);
    const result = await this.prisma.todo.delete({ where: { id } });
    return { ...result, id: toTodoNodeId(result.id) };
  }
}
