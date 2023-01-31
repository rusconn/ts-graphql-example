import { nanoid } from "nanoid";

import * as DataSource from "@/datasources";
import { toTodoNode, toUserNode } from "@/graphql/adapters";
import type { Graph } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Mutation: {
    createTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const parsed = parsers.Mutation.createTodo(args);

      const todo = await prisma.todo.create({
        data: { ...parsed, id: nanoid(), userId: user.id },
      });

      return {
        __typename: "CreateTodoSucceeded",
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
          __typename: "UpdateTodoSucceeded",
          todo: toTodoNode(todo),
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "UpdateTodoFailed",
            errors: [
              {
                __typename: "TodoNotFoundError",
                message: "todo not found",
              },
            ],
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
          __typename: "DeleteTodoSucceeded",
          id: args.id,
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "DeleteTodoFailed",
            errors: [
              {
                __typename: "TodoNotFoundError",
                message: "todo not found",
              },
            ],
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
          __typename: "CompleteTodoSucceeded",
          todo: toTodoNode(todo),
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "CompleteTodoFailed",
            errors: [
              {
                __typename: "TodoNotFoundError",
                message: "todo not found",
              },
            ],
          };
        }

        throw e;
      }
    },
    uncompleteTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id, ...data } = parsers.Mutation.uncompleteTodo(args);

      const todo = await prisma.todo.update({
        where: { id, userId: user.id },
        data,
      });

      return {
        todo: toTodoNode(todo),
      };
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
};
