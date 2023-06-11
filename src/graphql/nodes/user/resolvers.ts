import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";

import { passwordHashRoundsExponent } from "@/config";
import * as DataSource from "@/datasources";
import { toUserNode, toUserNodeId } from "@/graphql/adapters";
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
          __typename: "SignupSuccess",
          id: toUserNodeId(user.id),
        };
      } catch (e) {
        // ほぼ確実に email の衝突
        if (e instanceof DataSource.NotUniqueError) {
          logger.error(e, "error info");

          return {
            __typename: "EmailAlreadyTakenError",
            message: "specified email already taken",
          };
        }

        throw e;
      }
    },
    login: async (_, args, { dataSources: { prisma }, logger }) => {
      const data = parsers.Mutation.login(args);

      try {
        const refreshedUser = await prisma.$transaction(async tx => {
          const user = await tx.user.findUniqueOrThrow({
            where: { email: data.email },
          });

          if (!bcrypt.compareSync(data.password, user.password)) {
            throw new DataSource.NotFoundError();
          }

          return tx.user.update({
            where: { email: data.email },
            data: { token: nanoid() },
          });
        });

        return {
          __typename: "LoginSuccess",
          user: toUserNode(refreshedUser),
        };
      } catch (e) {
        if (e instanceof DataSource.NotFoundError) {
          logger.error(e, "error info");

          return {
            __typename: "UserNotFoundError",
            message: "user not found",
          };
        }

        throw e;
      }
    },
    logout: async (_, __, { dataSources: { prisma }, user: contextUser }) => {
      const user = await prisma.user.update({
        where: { id: contextUser.id },
        data: { token: null },
      });

      return {
        __typename: "LogoutSuccess",
        user: toUserNode(user),
      };
    },
    updateMe: async (_, args, { dataSources: { prisma }, user: contextUser, logger }) => {
      const data = parsers.Mutation.updateMe(args);

      try {
        const user = await prisma.user.update({
          where: { id: contextUser.id },
          data,
        });

        return {
          __typename: "UpdateMeSuccess",
          user: toUserNode(user),
        };
      } catch (e) {
        if (e instanceof DataSource.NotUniqueError) {
          logger.error(e, "error info");

          return {
            __typename: "EmailAlreadyTakenError",
            message: "specified email already taken",
          };
        }

        throw e;
      }
    },
    deleteMe: async (_, __, { dataSources: { prisma }, user }) => {
      await prisma.user.delete({
        where: { id: user.id },
      });

      return {
        __typename: "DeleteMeSuccess",
        id: toUserNodeId(user.id),
      };
    },
  },
};
