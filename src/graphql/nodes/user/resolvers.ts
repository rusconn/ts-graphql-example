import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import { nanoid } from "nanoid";

import type * as DataSource from "@/datasources";
import { toTodoNode, toTodoNodeId, toUserNode, toUserNodeId } from "@/graphql/adapters";
import type { Graph, Mapper } from "@/graphql/types";
import { parsers } from "./parsers";

export const resolvers: Graph.Resolvers = {
  Query: {
    me: async (_, __, { dataSources: { prisma }, user: contextUser }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: contextUser.id },
      });

      return toUserNode(user);
    },
    users: async (_, args, { dataSources: { prisma } }, resolveInfo) => {
      const { orderBy, first, last, before, after } = parsers.Query.users(args);

      return findManyCursorConnection<DataSource.User, Pick<Mapper.User, "id">, Mapper.User>(
        async args_ => prisma.user.findMany({ ...args_, orderBy }),
        async () => prisma.user.count(),
        { first, last, before, after },
        {
          resolveInfo,
          getCursor: record => ({ id: toUserNodeId(record.id) }),
          recordToEdge: record => ({ node: toUserNode(record) }),
        }
      );
    },
    user: async (_, args, { dataSources: { prisma } }) => {
      const { id } = parsers.Query.user(args);

      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return toUserNode(user);
    },
  },
  Mutation: {
    signup: async (_, args, { dataSources: { prisma } }) => {
      const data = parsers.Mutation.signup(args);

      const user = await prisma.user.create({
        data: { ...data, id: nanoid(), token: nanoid() },
      });

      return toUserNode(user);
    },
    updateMe: async (_, args, { dataSources: { prisma }, user: contextUser }) => {
      const data = parsers.Mutation.updateMe(args);

      const user = await prisma.user.update({
        where: { id: contextUser.id },
        data,
      });

      return toUserNode(user);
    },
    deleteMe: async (_, __, { dataSources: { prisma }, user }) => {
      await prisma.user.delete({
        where: { id: user.id },
      });

      return toUserNodeId(user.id);
    },
  },
  User: {
    todos: async ({ id }, args, { dataSources: { prisma } }, resolveInfo) => {
      const { orderBy, userId, first, last, before, after } = parsers.User.todos({ ...args, id });

      const userPromise = prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });

      return findManyCursorConnection<DataSource.Todo, Pick<Mapper.Todo, "id">, Mapper.Todo>(
        async args_ => userPromise.todos({ ...args_, orderBy }),
        async () => (await userPromise.todos()).length,
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
