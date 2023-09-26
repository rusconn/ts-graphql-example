import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { ulid } from "ulid";

import * as DataSource from "@/datasources";
import type * as Graph from "../common/schema";
import { adapters } from "./adapters";
import { parsers } from "./parsers";

export type Todo = TodoKeys & TodoPermissionCheckFields;
type TodoKeys = Pick<DataSource.Todo, "id">;
type TodoPermissionCheckFields = Pick<DataSource.Todo, "userId">;

export const resolvers: Graph.Resolvers = {
  Mutation: {
    createTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const parsed = parsers.Mutation.createTodo(args);

      const todo = await prisma.todo.create({
        data: { ...parsed, id: ulid(), userId: user.id },
        select: { id: true, userId: true },
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
          select: { id: true, userId: true },
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
          select: { id: true },
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
          select: { id: true, userId: true },
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
          select: { id: true, userId: true },
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
    id: async ({ id }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id },
      });

      return adapters.Todo.id(todo.id);
    },
    createdAt: async ({ id }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id },
      });

      return todo.createdAt;
    },
    updatedAt: async ({ id }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id },
      });

      return todo.updatedAt;
    },
    title: async ({ id }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id },
      });

      return todo.title;
    },
    description: async ({ id }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id },
      });

      return todo.description;
    },
    status: async ({ id }, _, { dataSources: { prisma } }) => {
      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id },
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

      return findManyCursorConnection<Todo>(
        async findManyArgs =>
          userPromise.todos({
            ...findManyArgs,
            orderBy,
            select: { id: true, userId: true },
          }),
        async () => (await userPromise.todos({ select: { id: true } })).length,
        { first, last, before, after },
        { resolveInfo }
      );
    },
  },
};
