import * as Prisma from "@/prisma";
import * as Graph from "../common/schema";
import { parseConnectionArgs, ParseError, parseSomeNodeId } from "../common/parsers";
import { nodeType } from "./typeDefs";

export const parseTodoNodeId = parseSomeNodeId(nodeType);

export const parsers = {
  Mutation: {
    createTodo: (args: Graph.MutationCreateTodoArgs) => {
      const { title, description } = args.input;

      if ([...title].length > 100) {
        throw new ParseError("`title` must be up to 100 characters");
      }
      if ([...description].length > 5000) {
        throw new ParseError("`description` must be up to 5000 characters");
      }

      return { title, description };
    },
    updateTodo: (args: Graph.MutationUpdateTodoArgs) => {
      const { id, input } = args;
      const { title, description, status } = input;

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
    deleteTodo: ({ id }: Graph.MutationDeleteTodoArgs) => {
      return { id: parseTodoNodeId(id) };
    },
    completeTodo: ({ id }: Graph.MutationCompleteTodoArgs) => {
      return { id: parseTodoNodeId(id), status: Prisma.TodoStatus.DONE };
    },
    uncompleteTodo: ({ id }: Graph.MutationUncompleteTodoArgs) => {
      return { id: parseTodoNodeId(id), status: Prisma.TodoStatus.PENDING };
    },
  },
  User: {
    todo: (args: Graph.UserTodoArgs) => {
      return { id: parseTodoNodeId(args.id) };
    },
    todos: (args: Graph.UserTodosArgs) => {
      const { orderBy, ...connectionArgs } = args;

      const { first, last, before, after } = parseConnectionArgs(connectionArgs);

      if (first == null && last == null) {
        throw new ParseError("`first` or `last` value required");
      }
      if (first && first > 50) {
        throw new ParseError("`first` must be up to 50");
      }
      if (last && last > 50) {
        throw new ParseError("`last` must be up to 50");
      }

      const firstToUse = first == null && last == null ? 20 : first;

      const directionToUse =
        orderBy.direction === Graph.OrderDirection.Asc
          ? Prisma.Prisma.SortOrder.asc
          : Prisma.Prisma.SortOrder.desc;

      const orderByToUse =
        orderBy.field === Graph.TodoOrderField.CreatedAt
          ? [{ createdAt: directionToUse }, { id: directionToUse }]
          : [{ updatedAt: directionToUse }, { id: directionToUse }];

      return { first: firstToUse, last, before, after, orderBy: orderByToUse };
    },
  },
};
