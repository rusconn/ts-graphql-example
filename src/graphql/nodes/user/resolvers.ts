import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { passwordHashRoundsExponent } from "@/config";
import * as DataSource from "@/datasources";
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
        args_ => prisma.user.findMany({ ...args_, orderBy }),
        () => prisma.user.count(),
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
      const { password, ...data } = parsers.Mutation.signup(args);

      const user = await prisma.user.create({
        data: {
          ...data,
          id: nanoid(),
          password: bcrypt.hashSync(password, passwordHashRoundsExponent),
          token: nanoid(),
        },
      });

      return toUserNodeId(user.id);
    },
    login: async (_, args, { dataSources: { prisma } }) => {
      const { email, password } = parsers.Mutation.login(args);

      const refreshedUser = await prisma.$transaction(async tx => {
        const user = await tx.user.findUniqueOrThrow({
          where: { email },
        });

        if (!bcrypt.compareSync(password, user.password)) {
          throw new DataSource.NotFoundError();
        }

        return tx.user.update({
          where: { email },
          data: { token: nanoid() },
        });
      });

      return toUserNode(refreshedUser);
    },
    logout: async (_, __, { dataSources: { prisma }, user: contextUser }) => {
      const user = await prisma.user.update({
        where: { id: contextUser.id },
        data: { token: null },
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

      return findManyCursorConnection<DataSource.Todo, Pick<Mapper.Todo, "id">, Mapper.Todo>(
        args_ => prisma.todo.findMany({ ...args_, orderBy, where: { userId } }),
        () => prisma.todo.count({ where: { userId } }),
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
