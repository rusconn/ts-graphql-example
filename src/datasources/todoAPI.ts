import type { Todo, User } from "@prisma/client";

import { CreateTodoInput, TodosOption, TodosOrder, UpdateTodoInput } from "@/types";
import { nonEmptyString, positiveInt } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";

export class TodoAPI extends PrismaDataSource {
  @catchPrismaError
  async getsByUserId(id: User["id"], { order, first, cursor }: TodosOption) {
    // codegen の設定を変更できたら不要 codegen.yml 参照
    const defaultedOrder = order ?? TodosOrder.Desc;
    const defaultedFirst = first ?? positiveInt(20);

    const direction = defaultedOrder === TodosOrder.Desc ? "desc" : "asc";

    // prisma の型が間違っているので正しい型に直している
    // https://github.com/prisma/prisma/issues/10687
    const todos = (await this.prisma.user.findUnique({ where: { id } }).todos({
      take: (defaultedFirst as number) + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: [{ updatedAt: direction }, { id: direction }],
    })) as Todo[] | null;

    if (!todos) {
      return null;
    }

    if (todos.length <= defaultedFirst) {
      return { todos };
    }

    const nextTodo = todos.pop() as Todo;
    return { todos, cursor: nonEmptyString(nextTodo.id) };
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
