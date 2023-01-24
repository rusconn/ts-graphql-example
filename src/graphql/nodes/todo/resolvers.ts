import { nanoid } from "nanoid";

import { toTodoNode, toUserNode } from "@/graphql/adapters";
import type { Graph } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Mutation: {
    createMyTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const parsed = parsers.Mutation.createMyTodo(args);

      const todo = await prisma.todo.create({
        data: { ...parsed, id: nanoid(), userId: user.id },
      });

      return toTodoNode(todo);
    },
    updateMyTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id, ...data } = parsers.Mutation.updateMyTodo(args);

      const todo = await prisma.todo.update({
        where: { id, userId: user.id },
        data,
      });

      return toTodoNode(todo);
    },
    deleteMyTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id } = parsers.Mutation.deleteMyTodo(args);

      await prisma.todo.delete({
        where: { id, userId: user.id },
      });

      return args.id;
    },
    completeMyTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id, ...data } = parsers.Mutation.completeMyTodo(args);

      const todo = await prisma.todo.update({
        where: { id, userId: user.id },
        data,
      });

      return toTodoNode(todo);
    },
    uncompleteMyTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id, ...data } = parsers.Mutation.uncompleteMyTodo(args);

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
