import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { nanoid } from "nanoid";

import * as DataSource from "@/datasources";
import { toTodoNode, toTodoNodeId, toUserNode } from "@/graphql/adapters";
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
        todo: toTodoNode(todo),
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
          todo: toTodoNode(todo),
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
        await prisma.todo.delete({
          where: { id, userId: user.id },
        });

        return {
          __typename: "DeleteTodoSuccess",
          id: args.id,
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
          todo: toTodoNode(todo),
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
          todo: toTodoNode(todo),
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
    user: async ({ userId }, __, { dataSources: { prisma } }) => {
      // findUniqueOrThrow を使いたいが、バッチ化されない
      // https://github.com/prisma/prisma/issues/16625
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`user not found: ${userId}`);
      }

      return toUserNode(user);
    },
  },
  User: {
    todo: async (parent, args, { dataSources: { prisma } }) => {
      const { id, userId } = parsers.User.todo(parent, args);

      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId },
      });

      return toTodoNode(todo);
    },
    todos: async ({ id }, args, { dataSources: { prisma } }, resolveInfo) => {
      const { orderBy, userId, first, last, before, after } = parsers.User.todos({ ...args, id });

      // findUniqueOrThrow を使いたいが、バッチ化されない
      // https://github.com/prisma/prisma/issues/16625
      const userPromise = prisma.user.findUnique({
        where: { id: userId },
      });

      return findManyCursorConnection<DataSource.Todo, Pick<Mapper.Todo, "id">, Mapper.Todo>(
        async args_ => {
          const todos = await userPromise.todos({ ...args_, orderBy });

          if (!todos) throw new Error(`parent not found: ${userId}`);

          return todos;
        },
        async () => {
          const todos = await userPromise.todos();

          if (!todos) throw new Error(`parent not found: ${userId}`);

          return todos.length;
        },
        { first, last, before, after },
        {
          resolveInfo,
          getCursor: record => ({ id: toTodoNodeId(record.id) }),
          recordToEdge: record => ({ node: toTodoNode(record) }),
        }
      );
    },
  },
};