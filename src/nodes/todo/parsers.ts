import type {
  CreateTodoParams,
  DeleteTodoParams,
  GetTodoParams,
  GetUserTodosParams,
  UpdateTodoParams,
} from "@/datasources";
import { ParseError } from "@/errors";
import {
  MutationCompleteTodoArgs,
  MutationCreateTodoArgs,
  MutationDeleteTodoArgs,
  MutationUncompleteTodoArgs,
  MutationUpdateTodoArgs,
  OrderDirection,
  QueryTodoArgs,
  QueryTodosArgs,
  TodoOrderField,
} from "@/types";
import { assertIsTodoId, assertIsUserId, parseConnectionArgs } from "@/utils";

export const parsers = {
  Query: {
    todos: (args: QueryTodosArgs): Omit<GetUserTodosParams, "info"> => {
      const { userId, orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      if (before) {
        try {
          assertIsTodoId(before);
        } catch (e) {
          if (e instanceof Error) {
            throw new ParseError("invalid `before`", e);
          }

          throw e;
        }
      }

      if (after) {
        try {
          assertIsTodoId(after);
        } catch (e) {
          if (e instanceof Error) {
            throw new ParseError("invalid `after`", e);
          }

          throw e;
        }
      }

      try {
        assertIsUserId(userId);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `userId`", e);
        }

        throw e;
      }

      const defaultedConnectionArgs =
        first == null && last == null
          ? { first: 20, last, before, after }
          : { first, last, before, after };

      const directionToUse = orderBy?.direction === OrderDirection.Asc ? "asc" : "desc";

      const orderByToUse =
        orderBy?.field === TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse } as const, { id: directionToUse } as const]
          : [{ updatedAt: directionToUse } as const, { id: directionToUse } as const];

      return { ...defaultedConnectionArgs, userId, orderBy: orderByToUse };
    },
    todo: (args: QueryTodoArgs): GetTodoParams => {
      const { id } = args;

      try {
        assertIsTodoId(args.id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `id`", e);
        }
        throw e;
      }

      return { id };
    },
  },
  Mutation: {
    createTodo: (args: MutationCreateTodoArgs): CreateTodoParams => {
      const {
        userId,
        input: { title, description },
      } = args;

      if ([...title].length > 100) {
        throw new ParseError("`title` must be up to 100 characters");
      }

      if ([...description].length > 5000) {
        throw new ParseError("`description` must be up to 5000 characters");
      }

      try {
        assertIsUserId(userId);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `userId`", e);
        }
        throw e;
      }

      return { userId, title, description };
    },
    updateTodo: (args: MutationUpdateTodoArgs): UpdateTodoParams => {
      const {
        id,
        input: { title, description, status },
      } = args;

      if (title === null) {
        throw new ParseError("`title` must be not null");
      }

      if (description === null) {
        throw new ParseError("`description` must be not null");
      }

      if (status === null) {
        throw new ParseError("`status` must be not null");
      }

      if (title && [...title].length > 100) {
        throw new ParseError("`title` must be up to 100 characters");
      }

      if (description && [...description].length > 5000) {
        throw new ParseError("`description` must be up to 5000 characters");
      }

      try {
        assertIsTodoId(id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `id`", e);
        }
        throw e;
      }

      return { id, title, description, status };
    },
    deleteTodo: (args: MutationDeleteTodoArgs): DeleteTodoParams => {
      const { id } = args;

      try {
        assertIsTodoId(id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `id`", e);
        }
        throw e;
      }

      return { id };
    },
    completeTodo: (args: MutationCompleteTodoArgs): UpdateTodoParams => {
      const { id } = args;

      try {
        assertIsTodoId(args.id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `id`", e);
        }
        throw e;
      }

      return { id };
    },
    uncompleteTodo: (args: MutationUncompleteTodoArgs): UpdateTodoParams => {
      const { id } = args;

      try {
        assertIsTodoId(args.id);
      } catch (e) {
        if (e instanceof Error) {
          throw new ParseError("invalid `id`", e);
        }
        throw e;
      }

      return { id };
    },
  },
};
