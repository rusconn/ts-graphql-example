import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import type { Todo, User } from "@/types";
import { todoId } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { NotFoundError } from "./errors";

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

export class TodoAPI extends PrismaDataSource {
  @catchPrismaError
  getsUserTodos({ userId, info, orderBy, ...paginationArgs }: GetUserTodosParams) {
    const userPromise = this.prisma.user.findUnique({
      where: { id: userId },
    });

    return findManyCursorConnection<Prisma.Todo, Pick<Prisma.Todo, "id">>(
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
      { resolveInfo: info }
    );
  }

  @catchPrismaError
  async get({ id }: GetTodoParams) {
    const result = await this.prisma.todo.findUnique({ where: { id } });

    if (!result) {
      throw new NotFoundError("Not found");
    }

    return result;
  }

  @catchPrismaError
  create({ userId, ...data }: CreateTodoParams) {
    return this.prisma.todo.create({ data: { id: todoId(), ...data, userId } });
  }

  @catchPrismaError
  update({ id, ...data }: UpdateTodoParams) {
    return this.prisma.todo.update({ where: { id }, data });
  }

  @catchPrismaError
  delete({ id }: DeleteTodoParams) {
    return this.prisma.todo.delete({ where: { id } });
  }
}
