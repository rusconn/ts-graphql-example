import { Prisma, PrismaClient, User, Todo, TodoStatus } from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import { nanoid } from "nanoid";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import { prisma } from "./internal/prisma";

export { type Todo, TodoStatus };
export const TodoSortOrder = Prisma.SortOrder;

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

export type CreateManyTodoParams = CreateTodoParams[];

export type CreateManyTodoForTestParams = (CreateTodoParams & {
  id?: Todo["id"];
  createdAt?: Todo["createdAt"];
  updatedAt?: Todo["updatedAt"];
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

export class TodoAPI {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async count({ userId }: CountTodosParams = {}) {
    return this.prisma.todo.count({ where: { userId } });
  }

  async getsUserTodos({ userId, info, orderBy, first, last, before, after }: GetUserTodosParams) {
    const userPromise = this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return findManyCursorConnection<Todo, Pick<Todo, "id">>(
      async args => userPromise.todos({ ...args, orderBy }),
      async () => (await userPromise.todos()).length,
      { first, last, before, after },
      { resolveInfo: info }
    );
  }

  async get({ id }: GetTodoParams) {
    return this.prisma.todo.findUniqueOrThrow({ where: { id } });
  }

  async getOptional({ id }: GetTodoParams) {
    return this.prisma.todo.findUnique({ where: { id } });
  }

  async create({ title, description, userId }: CreateTodoParams) {
    return this.prisma.todo.create({ data: { id: nanoid(), title, description, userId } });
  }

  async createMany(params: CreateManyTodoParams) {
    const data = params.map(({ title, description, userId }) => ({
      id: nanoid(),
      title,
      description,
      userId,
    }));

    return this.prisma.todo.createMany({ data });
  }

  async createManyForTest(params: CreateManyTodoForTestParams) {
    const data = params.map(({ id, title, description, userId, createdAt, updatedAt }) => ({
      id: id ?? nanoid(),
      title,
      description,
      userId,
      createdAt,
      updatedAt,
    }));

    return this.prisma.todo.createMany({ data });
  }

  async update({ id, title, description, status }: UpdateTodoParams) {
    return this.prisma.todo.update({ where: { id }, data: { title, description, status } });
  }

  async upsert({ id, title, description, userId }: UpsertTodoParams) {
    const todo = { id, title, description, userId };

    return this.prisma.todo.upsert({ where: { id: todo.id }, create: todo, update: todo });
  }

  async delete({ id }: DeleteTodoParams) {
    return this.prisma.todo.delete({ where: { id } });
  }

  async deleteAll() {
    return this.prisma.todo.deleteMany();
  }
}
