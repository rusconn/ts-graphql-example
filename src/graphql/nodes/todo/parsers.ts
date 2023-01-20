import * as DataSource from "@/datasources";
import { ParseError } from "@/graphql/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs, parseTodoNodeId } from "@/graphql/utils";

export const parsers = {
  Query: {
    myTodos: (
      args: Graph.QueryMyTodosArgs
    ): Omit<DataSource.GetUserTodosParams, "userId" | "info"> => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }

      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      const firstToUse = first == null && last == null ? 20 : first;

      const beforeToUse = before ? parseTodoNodeId(before) : before;
      const afterToUse = after ? parseTodoNodeId(after) : after;

      const directionToUse =
        orderBy?.direction === Graph.OrderDirection.Asc
          ? DataSource.TodoSortOrder.asc
          : DataSource.TodoSortOrder.desc;

      const orderByToUse =
        orderBy?.field === Graph.TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse }, { id: directionToUse }]
          : [{ updatedAt: directionToUse }, { id: directionToUse }];

      return {
        first: firstToUse,
        last,
        before: beforeToUse,
        after: afterToUse,
        orderBy: orderByToUse,
      };
    },
    myTodo: ({ id }: Graph.QueryMyTodoArgs): DataSource.GetTodoParams => {
      return { id: parseTodoNodeId(id) };
    },
  },
  Mutation: {
    createMyTodo: (
      args: Graph.MutationCreateMyTodoArgs
    ): Omit<DataSource.CreateTodoParams, "userId"> => {
      const {
        input: { title, description },
      } = args;

      if ([...title].length > 100) {
        throw new ParseError("`title` must be up to 100 characters");
      }

      if ([...description].length > 5000) {
        throw new ParseError("`description` must be up to 5000 characters");
      }

      return { title, description };
    },
    updateMyTodo: (args: Graph.MutationUpdateMyTodoArgs): DataSource.UpdateTodoParams => {
      const {
        id,
        input: { title, description, status },
      } = args;

      const idToUse = parseTodoNodeId(id);

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

      return { id: idToUse, title, description, status };
    },
    deleteMyTodo: ({ id }: Graph.MutationDeleteMyTodoArgs): DataSource.DeleteTodoParams => {
      return { id: parseTodoNodeId(id) };
    },
    completeMyTodo: ({ id }: Graph.MutationCompleteMyTodoArgs): DataSource.CompleteTodoParams => {
      return { id: parseTodoNodeId(id) };
    },
    uncompleteTodo: ({ id }: Graph.MutationUncompleteTodoArgs): DataSource.UncompleteTodoParams => {
      return { id: parseTodoNodeId(id) };
    },
  },
};
