import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { ulid } from "ulid";

import * as Prisma from "@/prisma";
import type * as Graph from "../common/schema";
import { forbiddenError } from "../common/permissions";
import { adapters } from "./adapters";
import { parsers } from "./parsers";

export type Todo = Pick<Prisma.Todo, "id"> & Partial<Pick<Prisma.Todo, "userId">>;

export const resolvers: Graph.Resolvers = {
  Mutation: {
    createTodo: async (_, args, { prisma, user }) => {
      const parsed = parsers.Mutation.createTodo(args);

      const todo = await prisma.todo.create({
        data: { ...parsed, id: ulid(), userId: user.id },
        select: { id: true },
      });

      return {
        __typename: "CreateTodoSuccess",
        todo,
      };
    },
    updateTodo: async (_, args, { prisma, user, logger }) => {
      const { id, ...data } = parsers.Mutation.updateTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: user.id },
          data,
          select: { id: true },
        });

        return {
          __typename: "UpdateTodoSuccess",
          todo,
        };
      } catch (e) {
        if (e instanceof Prisma.NotExistsError) {
          logger.error(e, "error info");

          return {
            __typename: "TodoNotFoundError",
            message: "todo not found",
          };
        }

        throw e;
      }
    },
    deleteTodo: async (_, args, { prisma, user, logger }) => {
      const { id } = parsers.Mutation.deleteTodo(args);

      try {
        const todo = await prisma.todo.delete({
          where: { id, userId: user.id },
          select: { id: true },
        });

        return {
          __typename: "DeleteTodoSuccess",
          id: adapters.Todo.id(todo.id),
        };
      } catch (e) {
        if (e instanceof Prisma.NotExistsError) {
          logger.error(e, "error info");

          return {
            __typename: "TodoNotFoundError",
            message: "todo not found",
          };
        }

        throw e;
      }
    },
    completeTodo: async (_, args, { prisma, user, logger }) => {
      const { id, ...data } = parsers.Mutation.completeTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: user.id },
          data,
          select: { id: true },
        });

        return {
          __typename: "CompleteTodoSuccess",
          todo,
        };
      } catch (e) {
        if (e instanceof Prisma.NotExistsError) {
          logger.error(e, "error info");

          return {
            __typename: "TodoNotFoundError",
            message: "todo not found",
          };
        }

        throw e;
      }
    },
    uncompleteTodo: async (_, args, { prisma, user, logger }) => {
      const { id, ...data } = parsers.Mutation.uncompleteTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: user.id },
          data,
          select: { id: true },
        });

        return {
          __typename: "UncompleteTodoSuccess",
          todo,
        };
      } catch (e) {
        if (e instanceof Prisma.NotExistsError) {
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
    id: async ({ id, userId }, _, { prisma, user }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      if (user.role !== "ADMIN" && user.id !== todo.userId) {
        throw forbiddenError();
      }

      return adapters.Todo.id(todo.id);
    },
    createdAt: async ({ id, userId }, _, { prisma, user }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      if (user.role !== "ADMIN" && user.id !== todo.userId) {
        throw forbiddenError();
      }

      return todo.createdAt;
    },
    updatedAt: async ({ id, userId }, _, { prisma, user }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      if (user.role !== "ADMIN" && user.id !== todo.userId) {
        throw forbiddenError();
      }

      return todo.updatedAt;
    },
    title: async ({ id, userId }, _, { prisma, user }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      if (user.id !== todo.userId) {
        throw forbiddenError();
      }

      return todo.title;
    },
    description: async ({ id, userId }, _, { prisma, user }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      if (user.id !== todo.userId) {
        throw forbiddenError();
      }

      return todo.description;
    },
    status: async ({ id, userId }, _, { prisma, user }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      if (user.id !== todo.userId) {
        throw forbiddenError();
      }

      return adapters.Todo.status(todo.status);
    },
    user: async ({ id, userId }, _, { prisma, user }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      if (user.role !== "ADMIN" && user.id !== todo.userId) {
        throw forbiddenError();
      }

      return { id: todo.userId };
    },
  },
  User: {
    todo: ({ id: userId }, args) => {
      const { id } = parsers.User.todo(args);

      return { id, userId };
    },
    todos: async ({ id }, args, { prisma }, resolveInfo) => {
      const { orderBy, first, last, before, after } = parsers.User.todos(args);

      return findManyCursorConnection<Todo>(
        async findManyArgs =>
          prisma.todo.findMany({
            ...findManyArgs,
            where: { userId: id },
            orderBy,
            select: { id: true },
          }),
        () => prisma.todo.count({ where: { userId: id } }),
        { first, last, before, after },
        { resolveInfo }
      );
    },
  },
};
