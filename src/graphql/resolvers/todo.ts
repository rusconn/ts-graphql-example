import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { nanoid } from "nanoid";

import * as DataSource from "@/datasources";
import { adapters } from "@/graphql/adapters/todo";
import type { Graph, Mapper } from "@/graphql/types";
import parsers from "@/graphql/parsers/todo";

export const resolvers: Graph.Resolvers = {
  Mutation: {
    createTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const parsed = parsers.Mutation.createTodo(args);

      const todo = await prisma.todo.create({
        data: { ...parsed, id: nanoid(), userId: user.id },
      });

      return {
        __typename: "CreateTodoSuccess",
        todo,
      };
    },
    updateTodo: async (_, args, { dataSources: { prisma }, user, logger }) => {
      const { id, ...data } = parsers.Mutation.updateTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: user.id },
          data,
        });

        return {
          __typename: "UpdateTodoSuccess",
          todo,
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "TodoNotFoundError",
            message: "todo not found",
          };
        }

        throw e;
      }
    },
    deleteTodo: async (_, args, { dataSources: { prisma }, user, logger }) => {
      const { id } = parsers.Mutation.deleteTodo(args);

      try {
        const todo = await prisma.todo.delete({
          where: { id, userId: user.id },
        });

        return {
          __typename: "DeleteTodoSuccess",
          id: adapters.Todo.id(todo.id),
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "TodoNotFoundError",
            message: "todo not found",
          };
        }

        throw e;
      }
    },
    completeTodo: async (_, args, { dataSources: { prisma }, user, logger }) => {
      const { id, ...data } = parsers.Mutation.completeTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: user.id },
          data,
        });

        return {
          __typename: "CompleteTodoSuccess",
          todo,
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "TodoNotFoundError",
            message: "todo not found",
          };
        }

        throw e;
      }
    },
    uncompleteTodo: async (_, args, { dataSources: { prisma }, user, logger }) => {
      const { id, ...data } = parsers.Mutation.uncompleteTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: user.id },
          data,
        });

        return {
          __typename: "UncompleteTodoSuccess",
          todo,
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "TodoNotFoundError",
            message: "todo not found",
          };
        }

        throw e;
      }
    },
  },
  Todo: {
    id: async ({ id, userId }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      return adapters.Todo.id(todo.id);
    },
    createdAt: async ({ id, userId }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      return adapters.Todo.createdAt(todo.createdAt);
    },
    updatedAt: async ({ id, userId }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      return adapters.Todo.updatedAt(todo.updatedAt);
    },
    title: async ({ id, userId }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      return adapters.Todo.title(todo.title);
    },
    description: async ({ id, userId }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      return adapters.Todo.description(todo.description);
    },
    status: async ({ id, userId }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      return adapters.Todo.status(todo.status);
    },
    user: ({ userId }) => {
      return { id: userId };
    },
  },
  User: {
    todo: ({ id: userId }, args) => {
      const { id } = parsers.User.todo(args);

      return { id, userId };
    },
    todos: async ({ id }, args, { dataSources: { prisma } }, resolveInfo) => {
      const { orderBy, first, last, before, after } = parsers.User.todos(args);

      const userPromise = prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return findManyCursorConnection<DataSource.Todo, Pick<Mapper.Todo, "id">, Mapper.Todo>(
        async args_ => userPromise.todos({ ...args_, orderBy }),
        async () => (await userPromise.todos()).length,
        { first, last, before, after },
        { resolveInfo }
      );
    },
  },
};
