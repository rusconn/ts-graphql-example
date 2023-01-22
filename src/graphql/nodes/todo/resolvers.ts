import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { nanoid } from "nanoid";

import type * as DataSource from "@/datasources";
import { toTodoNode, toTodoNodeId, toUserNode } from "@/graphql/adapters";
import type { Graph, Mapper } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    myTodos: async (_, args, { dataSources: { prisma }, user }, resolveInfo) => {
      const { orderBy, first, last, before, after } = parsers.Query.myTodos(args);

      return findManyCursorConnection<DataSource.Todo, Pick<Mapper.Todo, "id">, Mapper.Todo>(
        args_ => prisma.todo.findMany({ ...args_, orderBy, where: { userId: user.id } }),
        () => prisma.todo.count({ where: { userId: user.id } }),
        { first, last, before, after },
        {
          resolveInfo,
          getCursor: record => ({ id: toTodoNodeId(record.id) }),
          recordToEdge: record => ({ node: toTodoNode(record) }),
        }
      );
    },
    myTodo: async (_, args, { dataSources: { prisma }, user }) => {
      const { id } = parsers.Query.myTodo(args);

      const todo = await prisma.todo.findUniqueOrThrow({
        where: { id, userId: user.id },
      });

      return toTodoNode(todo);
    },
  },
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
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });

      return toUserNode(user);
    },
  },
};
