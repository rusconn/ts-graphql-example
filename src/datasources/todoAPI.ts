import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import type { Todo, User } from "@/types";
import { todoId } from "@/utils";

export type GetUserTodosParams = ConnectionArguments & {
  userId: User["id"];
  orderBy: Exclude<Prisma.Prisma.TodoFindManyArgs["orderBy"], undefined>;
  info: GraphQLResolveInfo;
};

export type GetTodoParams = {
  id: Todo["id"];
};

export type CreateTodoParams = {
  userId: User["id"];
  title: Todo["title"];
  description: Todo["description"];
};

export type UpdateTodoParams = {
  id: Todo["id"];
  title?: Todo["title"];
  description?: Todo["description"];
  status?: Todo["status"];
};

export type DeleteTodoParams = {
  id: Todo["id"];
};

export class TodoAPI {
  constructor(private prisma: Prisma.PrismaClient) {}

  async getsUserTodos({ userId, info, orderBy, ...paginationArgs }: GetUserTodosParams) {
    const userPromise = this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return findManyCursorConnection<Prisma.Todo, Pick<Prisma.Todo, "id">>(
      async args => userPromise.todos({ ...args, orderBy }),
      async () => (await userPromise.todos()).length,
      paginationArgs,
      { resolveInfo: info }
    );
  }

  async get({ id }: GetTodoParams) {
    return this.prisma.todo.findUniqueOrThrow({ where: { id } });
  }

  async create({ userId, ...data }: CreateTodoParams) {
    return this.prisma.todo.create({ data: { id: todoId(), ...data, userId } });
  }

  async update({ id, ...data }: UpdateTodoParams) {
    return this.prisma.todo.update({ where: { id }, data });
  }

  async delete({ id }: DeleteTodoParams) {
    return this.prisma.todo.delete({ where: { id } });
  }
}
