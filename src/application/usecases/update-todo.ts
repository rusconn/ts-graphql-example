import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";
import * as Dto from "../dto.ts";

type UpdateTodoInput = {
  id: Todo.Id.Type;
  title?: Todo.Title.Type;
  description?: Todo.Description.Type;
  status?: Todo.Status.Type;
};

type UpdateTodoResult = DiscriminatedUnion<{
  ResourceNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    updated: Dto.Todo.Type;
  };
}>;

export const updateTodo = async (
  ctx: AppContextForAuthed,
  { id, ...input }: UpdateTodoInput,
): Promise<UpdateTodoResult> => {
  const todo = await ctx.repos.todo.find(id);
  if (!todo) {
    return { type: "ResourceNotFound" };
  }

  const updatedTodo = Todo.update(todo, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.update(updatedTodo);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    updated: Dto.Todo.fromDomain(updatedTodo),
  };
};
