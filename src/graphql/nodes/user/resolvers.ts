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
    me: async (_, __, { user }) => {
      // ミドルウェアでの権限チェックにより GUEST ではないことが保証される
      // しかし型に影響しないのでアサーションが必要になっている
      return toUserNode(user as DataSource.User);
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
    signup: async (_, args, { dataSources: { prisma }, logger }) => {
      const { password, ...data } = parsers.Mutation.signup(args);

      try {
        const user = await prisma.user.create({
          data: {
            ...data,
            id: nanoid(),
            password: bcrypt.hashSync(password, passwordHashRoundsExponent),
            token: nanoid(),
          },
        });

        return {
          __typename: "SignupSucceeded",
          id: toUserNodeId(user.id),
        };
      } catch (e) {
        // ほぼ確実に email の衝突
        if (e instanceof DataSource.NotUniqueError) {
          logger.error(e, "error info");

          return {
            __typename: "SignupFailed",
            errors: [
              {
                __typename: "EmailAlreadyTakenError",
                message: "specified email already taken",
              },
            ],
          };
        }

        throw e;
      }
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

      return {
        user: toUserNode(refreshedUser),
      };
    },
    logout: async (_, __, { dataSources: { prisma }, user: contextUser }) => {
      const user = await prisma.user.update({
        where: { id: contextUser.id },
        data: { token: null },
      });

      return {
        user: toUserNode(user),
      };
    },
    updateMe: async (_, args, { dataSources: { prisma }, user: contextUser }) => {
      const data = parsers.Mutation.updateMe(args);

      const user = await prisma.user.update({
        where: { id: contextUser.id },
        data,
      });

      return {
        user: toUserNode(user),
      };
    },
    deleteMe: async (_, __, { dataSources: { prisma }, user }) => {
      await prisma.user.delete({
        where: { id: user.id },
      });

      return {
        id: toUserNodeId(user.id),
      };
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
