import { Prisma, PrismaClient, User, Todo, TodoStatus } from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import { nanoid } from "nanoid";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import { prisma } from "./internal/prisma";

export type CountTodosParams = {
  userId?: Todo["userId"];
};

export type GetUserTodosParams = ConnectionArguments & {
  userId: User["id"];
  orderBy: Exclude<Prisma.TodoFindManyArgs["orderBy"], undefined>;
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

export type CreateManyTodoParams = (CreateTodoParams & {
  id: Todo["id"];
})[];

export type UpdateTodoParams = {
  id: Todo["id"];
  title?: Todo["title"];
  description?: Todo["description"];
  status?: Todo["status"];
};

export type UpsertTodoParams = CreateTodoParams & {
  id: Todo["id"];
};

export type DeleteTodoParams = {
  id: Todo["id"];
};

export type CompleteTodoParams = {
  id: Todo["id"];
};

export type UncompleteTodoParams = {
  id: Todo["id"];
};

export class TodoAPI {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async count({ userId }: CountTodosParams = {}) {
    return this.prisma.todo.count({ where: { userId } });
  }

  async getsUserTodos({ userId, info, orderBy, ...paginationArgs }: GetUserTodosParams) {
    const userPromise = this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return findManyCursorConnection<Todo, Pick<Todo, "id">>(
      async args => userPromise.todos({ ...args, orderBy }),
      async () => (await userPromise.todos()).length,
      paginationArgs,
      { resolveInfo: info }
    );
  }

  async get({ id }: GetTodoParams) {
    return this.prisma.todo.findUniqueOrThrow({ where: { id } });
  }

  async getOptional({ id }: GetTodoParams) {
    return this.prisma.todo.findUnique({ where: { id } });
  }

  async create({ userId, ...data }: CreateTodoParams) {
    return this.prisma.todo.create({ data: { id: nanoid(), ...data, userId } });
  }

  async createMany(data: CreateManyTodoParams) {
    return this.prisma.todo.createMany({ data });
  }

  async update({ id, ...data }: UpdateTodoParams) {
    return this.prisma.todo.update({ where: { id }, data });
  }

  async upsert(todo: UpsertTodoParams) {
    return this.prisma.todo.upsert({ where: { id: todo.id }, create: todo, update: todo });
  }

  async delete({ id }: DeleteTodoParams) {
    return this.prisma.todo.delete({ where: { id } });
  }

  async deleteAll() {
    return this.prisma.todo.deleteMany();
  }

  async complete({ id }: CompleteTodoParams) {
    return this.prisma.todo.update({ where: { id }, data: { status: TodoStatus.DONE } });
  }

  async uncomplete({ id }: UncompleteTodoParams) {
    return this.prisma.todo.update({ where: { id }, data: { status: TodoStatus.PENDING } });
  }
}
