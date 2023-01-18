import { Prisma } from "@prisma/client";

import type * as DataSource from "@/datasources";
import { ParseError } from "@/errors";
import { Graph } from "@/graphql/types";
import { parseConnectionArgs, parseTodoNodeId, parseUserNodeId } from "@/graphql/utils";

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

      const firstToUse = first == null && last == null ? 20 : first;

      const beforeToUse = before ? parseTodoNodeId(before) : before;
      const afterToUse = after ? parseTodoNodeId(after) : after;

      const userIdToUse = parseUserNodeId(userId);

      const directionToUse =
        orderBy?.direction === Graph.OrderDirection.Asc
          ? Prisma.SortOrder.asc
          : Prisma.SortOrder.desc;

      const orderByToUse =
        orderBy?.field === Graph.TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse }, { id: directionToUse }]
          : [{ updatedAt: directionToUse }, { id: directionToUse }];

      return {
        first: firstToUse,
        last,
        before: beforeToUse,
        after: afterToUse,
        userId: userIdToUse,
        orderBy: orderByToUse,
      };
    },
    todo: (args: Graph.QueryTodoArgs): DataSource.GetTodoParams => {
      const { id } = args;

      return { id: parseTodoNodeId(id) };
    },
  },
  Mutation: {
    createTodo: (args: Graph.MutationCreateTodoArgs): DataSource.CreateTodoParams => {
      const {
        userId,
        input: { title, description },
      } = args;

      const userIdToUse = parseUserNodeId(userId);

      if ([...title].length > 100) {
        throw new ParseError("`title` must be up to 100 characters");
      }

      if ([...description].length > 5000) {
        throw new ParseError("`description` must be up to 5000 characters");
      }

      return { userId: userIdToUse, title, description };
    },
    updateTodo: (args: Graph.MutationUpdateTodoArgs): DataSource.UpdateTodoParams => {
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
    deleteTodo: (args: Graph.MutationDeleteTodoArgs): DataSource.DeleteTodoParams => {
      const { id } = args;

      return { id: parseTodoNodeId(id) };
    },
    completeTodo: (args: Graph.MutationCompleteTodoArgs): DataSource.CompleteTodoParams => {
      const { id } = args;

      return { id: parseTodoNodeId(id) };
    },
    uncompleteTodo: (args: Graph.MutationUncompleteTodoArgs): DataSource.UncompleteTodoParams => {
      const { id } = args;

      return { id: parseTodoNodeId(id) };
    },
  },
};
