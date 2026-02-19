import type { EmptyObject } from "type-fest";

import type { Todo } from "../../domain/entities.ts";
import { EntityNotFoundError } from "../../domain/unit-of-works/_errors/entity-not-found.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";

type DeleteTodoResult = DiscriminatedUnion<{
  ResourceNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    deletedId: Todo.Id.Type;
  };
}>;

export const deleteTodo = async (
  ctx: AppContextForAuthed,
  id: Todo.Id.Type,
): Promise<DeleteTodoResult> => {
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.remove(id);
    });
  } catch (e) {
    if (e instanceof EntityNotFoundError) {
      return { type: "ResourceNotFound" };
    }
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    deletedId: id,
  };
};
