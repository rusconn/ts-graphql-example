import { nanoid } from "nanoid";

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
        todo: toTodoNode(todo),
      };
    },
    updateTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id, ...data } = parsers.Mutation.updateTodo(args);

      const todo = await prisma.todo.update({
        where: { id, userId: user.id },
        data,
      });

      return {
        todo: toTodoNode(todo),
      };
    },
    deleteTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id } = parsers.Mutation.deleteTodo(args);

      await prisma.todo.delete({
        where: { id, userId: user.id },
      });

      return {
        id: args.id,
      };
    },
    completeTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id, ...data } = parsers.Mutation.completeTodo(args);

      const todo = await prisma.todo.update({
        where: { id, userId: user.id },
        data,
      });

      return toTodoNode(todo);
    },
    uncompleteTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id, ...data } = parsers.Mutation.uncompleteTodo(args);

      const todo = await prisma.todo.update({
        where: { id, userId: user.id },
        data,
      });

      return toTodoNode(todo);
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
