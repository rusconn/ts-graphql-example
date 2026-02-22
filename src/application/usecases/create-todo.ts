import type { EmptyObject } from "type-fest";

import { Todo } from "../../domain/entities.ts";
import type { DiscriminatedUnion } from "../../util/type.ts";
import type { AppContextForAuthed } from "../context.ts";
import * as Dto from "../dto.ts";

type CreateTodoInput = {
  title: Todo.Title.Type;
  description: Todo.Description.Type;
};

type CreateTodoResult = DiscriminatedUnion<{
  ResourceLimitExceeded: {
    limit: number;
  };
  UserEntityNotFound: EmptyObject;
  TransactionFailed: {
    cause: unknown;
  };
  Success: {
    created: Dto.Todo.Type;
  };
}>;

export const createTodo = async (
  ctx: AppContextForAuthed,
  input: CreateTodoInput,
): Promise<CreateTodoResult> => {
  const count = await ctx.queries.todo.count();
  if (count >= Todo.MAX_COUNT) {
    return {
      type: "ResourceLimitExceeded",
      limit: Todo.MAX_COUNT,
    };
  }

  const user = await ctx.queries.user.find(ctx.user.id);
  if (!user) {
    return { type: "UserEntityNotFound" };
  }

  const todo = Todo.create(user.id, input);
  try {
    await ctx.unitOfWork.run(async (repos) => {
      await repos.todo.add(todo);
    });
  } catch (e) {
    return {
      type: "TransactionFailed",
      cause: e,
    };
  }

  return {
    type: "Success",
    created: Dto.Todo.fromDomain(todo),
  };
};

if (import.meta.vitest) {
  const args = {
    title: "dummy",
    description: "dummy",
  } as CreateTodoInput;

  const user = { id: "dummy" };

  describe("maximum count of todos", () => {
    const createQueries = (num: number) => ({
      todo: {
        count: async () => num,
        find: async () => ({}),
      },
      user: {
        find: async () => ({ id: "dummy" }),
      },
    });

    const unitOfWork = {
      run: async () => {},
    };

    const notExceededs = [0, 1, Todo.MAX_COUNT - 1];
    const exceededs = [Todo.MAX_COUNT, Todo.MAX_COUNT + 1];

    it.each(notExceededs)("not exceededs: %#", async (num) => {
      const queries = createQueries(num);
      const result = await createTodo(
        { user, queries, unitOfWork } as unknown as AppContextForAuthed,
        args,
      );
      expect(result?.type).not.toBe("ResourceLimitExceeded");
    });

    it.each(exceededs)("exceededs: %#", async (num) => {
      const queries = createQueries(num);
      const result = await createTodo(
        { user, queries, unitOfWork } as unknown as AppContextForAuthed,
        args,
      );
      expect(result?.type).toBe("ResourceLimitExceeded");
    });
  });
}
