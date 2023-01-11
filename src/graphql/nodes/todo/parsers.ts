import type * as DataSource from "@/datasources";
import { ParseError } from "@/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs } from "@/graphql/utils";
import { isTodoId, isUserId } from "@/ids";

export const parsers = {
  Query: {
    todos: (args: Graph.QueryTodosArgs): Omit<DataSource.GetUserTodosParams, "info"> => {
      const { userId, orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      if (before && !isTodoId(before)) {
        throw new ParseError("invalid `before`");
      }

      if (after && !isTodoId(after)) {
        throw new ParseError("invalid `after`");
      }

      if (!isUserId(userId)) {
        throw new ParseError("invalid `userId`");
      }

      const defaultedConnectionArgs =
        first == null && last == null
          ? { first: 20, last, before, after }
          : { first, last, before, after };

      const directionToUse = orderBy?.direction === Graph.OrderDirection.Asc ? "asc" : "desc";

      const orderByToUse =
        orderBy?.field === Graph.TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse } as const, { id: directionToUse } as const]
          : [{ updatedAt: directionToUse } as const, { id: directionToUse } as const];

      return { ...defaultedConnectionArgs, userId, orderBy: orderByToUse };
    },
    todo: (args: Graph.QueryTodoArgs): DataSource.GetTodoParams => {
      const { id } = args;

      if (!isTodoId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
  },
  Mutation: {
    createTodo: (args: Graph.MutationCreateTodoArgs): DataSource.CreateTodoParams => {
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

      if (!isUserId(userId)) {
        throw new ParseError("invalid `userId`");
      }

      return { userId, title, description };
    },
    updateTodo: (args: Graph.MutationUpdateTodoArgs): DataSource.UpdateTodoParams => {
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

      if (!isTodoId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id, title, description, status };
    },
    deleteTodo: (args: Graph.MutationDeleteTodoArgs): DataSource.DeleteTodoParams => {
      const { id } = args;

      if (!isTodoId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
    completeTodo: (args: Graph.MutationCompleteTodoArgs): DataSource.UpdateTodoParams => {
      const { id } = args;

      if (!isTodoId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
    uncompleteTodo: (args: Graph.MutationUncompleteTodoArgs): DataSource.UpdateTodoParams => {
      const { id } = args;

      if (!isTodoId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
  },
};
