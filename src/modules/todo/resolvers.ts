import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { ulid } from "ulid";

import * as Prisma from "@/prisma";
import type * as Graph from "../common/schema";
import { isFull, full, Full } from "../common/resolvers";
import { adapters } from "./adapters";
import { authorizers } from "./authorizers";
import { parsers } from "./parsers";

const fullTodo = async (prisma: Prisma.PrismaClient, parent: Todo) => {
  return isFull(parent)
    ? parent
    : prisma.todo.findUniqueOrThrow({
        where: { id: parent.id, userId: parent.userId },
      });
};

export type Todo =
  | (Pick<Prisma.Todo, "id"> & Partial<Pick<Prisma.Todo, "userId">>)
  | Full<Prisma.Todo>;

export const resolvers: Graph.Resolvers = {
  Mutation: {
    createTodo: async (_, args, { prisma, user }) => {
      const authed = authorizers.Mutation.createTodo(user);

      const parsed = parsers.Mutation.createTodo(args);

      const todo = await prisma.todo.create({
        data: { ...parsed, id: ulid(), userId: authed.id },
      });

      return {
        __typename: "CreateTodoSuccess",
        todo: full(todo),
      };
    },
    updateTodo: async (_, args, { prisma, user, logger }) => {
      const authed = authorizers.Mutation.updateTodo(user);

      const { id, ...data } = parsers.Mutation.updateTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: authed.id },
          data,
        });

        return {
          __typename: "UpdateTodoSuccess",
          todo: full(todo),
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
      const authed = authorizers.Mutation.deleteTodo(user);

      const { id } = parsers.Mutation.deleteTodo(args);

      try {
        const todo = await prisma.todo.delete({
          where: { id, userId: authed.id },
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
      const authed = authorizers.Mutation.completeTodo(user);

      const { id, ...data } = parsers.Mutation.completeTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: authed.id },
          data,
        });

        return {
          __typename: "CompleteTodoSuccess",
          todo: full(todo),
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
      const authed = authorizers.Mutation.uncompleteTodo(user);

      const { id, ...data } = parsers.Mutation.uncompleteTodo(args);

      try {
        const todo = await prisma.todo.update({
          where: { id, userId: authed.id },
          data,
        });

        return {
          __typename: "UncompleteTodoSuccess",
          todo: full(todo),
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
    id: async (parent, _, { prisma, user }) => {
      const todo = await fullTodo(prisma, parent);

      authorizers.Todo.id(user, todo);

      return adapters.Todo.id(todo.id);
    },
    createdAt: async (parent, _, { prisma, user }) => {
      const todo = await fullTodo(prisma, parent);

      authorizers.Todo.createdAt(user, todo);

      return todo.createdAt;
    },
    updatedAt: async (parent, _, { prisma, user }) => {
      const todo = await fullTodo(prisma, parent);

      authorizers.Todo.updatedAt(user, todo);

      return todo.updatedAt;
    },
    title: async (parent, _, { prisma, user }) => {
      const todo = await fullTodo(prisma, parent);

      authorizers.Todo.title(user, todo);

      return todo.title;
    },
    description: async (parent, _, { prisma, user }) => {
      const todo = await fullTodo(prisma, parent);

      authorizers.Todo.description(user, todo);

      return todo.description;
    },
    status: async (parent, _, { prisma, user }) => {
      const todo = await fullTodo(prisma, parent);

      authorizers.Todo.status(user, todo);

      return adapters.Todo.status(todo.status);
    },
    user: async (parent, _, { prisma, user }) => {
      const todo = await fullTodo(prisma, parent);

      authorizers.Todo.user(user, todo);

      return { id: todo.userId };
    },
  },
  User: {
    todo: ({ id: userId }, args, { user }) => {
      authorizers.User.todo(user, userId);

      const { id } = parsers.User.todo(args);

      return { id, userId };
    },
    todos: async ({ id }, args, { prisma, user }, resolveInfo) => {
      authorizers.User.todos(user, id);

      const { orderBy, first, last, before, after } = parsers.User.todos(args);

      return findManyCursorConnection(
        async findManyArgs =>
          prisma.todo
            .findMany({
              ...findManyArgs,
              where: { userId: id },
              orderBy,
            })
            .then(todos => todos.map(full)),
        () => prisma.todo.count({ where: { userId: id } }),
        { first, last, before, after },
        { resolveInfo }
      );
    },
  },
};
