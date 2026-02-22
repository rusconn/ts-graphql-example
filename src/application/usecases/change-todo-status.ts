import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";
import * as Dto from "../dto.ts";

type ChangeTodoStatusInput = {
  id: Todo.Id.Type;
  status: Todo.Status.Type;
};

type ChangeTodoStatusResult = DiscriminatedUnion<{
  ResourceNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    changed: Dto.Todo.Type;
  };
}>;

export const changeTodoStatus = async (
  ctx: AppContextForAuthed,
  { id, status }: ChangeTodoStatusInput,
): Promise<ChangeTodoStatusResult> => {
  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return { type: "ResourceNotFound" };
  }

  const changedTodo = Todo.changeStatus(todo, status);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.update(changedTodo);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    changed: Dto.Todo.fromDomain(changedTodo),
  };
};
