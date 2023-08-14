import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config";
import * as DataSource from "@/datasources";
import type * as Graph from "../common/schema";
import { selectInfo, WithSelect } from "../common/resolvers";
import { adapters } from "./adapters";
import { parsers } from "./parsers";

export type User = WithSelect<UserKeys, DataSource.UserSelectScalar>;
type UserKeys = Pick<DataSource.User, "id">;

export const resolvers: Graph.Resolvers = {
  Query: {
    me: (_, __, { user }, info) => {
      return { id: user.id, ...selectInfo(info) };
    },
    users: async (_, args, { dataSources: { prisma } }, resolveInfo) => {
      const { orderBy, first, last, before, after } = parsers.Query.users(args);

      return findManyCursorConnection<User>(
        findManyArgs =>
          prisma.user.findMany({
            ...findManyArgs,
            orderBy,
            select: { id: true },
          }),
        () => prisma.user.count(),
        { first, last, before, after },
        { resolveInfo }
      );
    },
    user: (_, args, __, info) => {
      const { id } = parsers.Query.user(args);

      return { id, ...selectInfo(info) };
    },
  },
  Mutation: {
    signup: async (_, args, { dataSources: { prisma }, logger }) => {
      const { password, ...data } = parsers.Mutation.signup(args);

      try {
        const user = await prisma.user.create({
          data: {
            ...data,
            id: ulid(),
            password: bcrypt.hashSync(password, passwordHashRoundsExponent),
            token: ulid(),
          },
          select: { id: true },
        });

        return {
          __typename: "SignupSuccess",
          id: adapters.User.id(user.id),
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
            select: { password: true },
          });

          if (!bcrypt.compareSync(data.password, user.password)) {
            throw new DataSource.NotFoundError();
          }

          return tx.user.update({
            where: { email: data.email },
            data: { token: ulid() },
            select: { id: true },
          });
        });

        return {
          __typename: "LoginSuccess",
          user: refreshedUser,
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
        select: { id: true },
      });

      return {
        __typename: "LogoutSuccess",
        user,
      };
    },
    updateMe: async (_, args, { dataSources: { prisma }, user: contextUser, logger }) => {
      const data = parsers.Mutation.updateMe(args);

      try {
        const user = await prisma.user.update({
          where: { id: contextUser.id },
          data,
          select: { id: true },
        });

        return {
          __typename: "UpdateMeSuccess",
          user,
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
      const deletedUser = await prisma.user.delete({
        where: { id: user.id },
        select: { id: true },
      });

      return {
        __typename: "DeleteMeSuccess",
        id: adapters.User.id(deletedUser.id),
      };
    },
  },
  User: {
    id: async ({ id, select }, _, { dataSources: { prisma } }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: select as { id: true },
      });

      return adapters.User.id(user.id);
    },
    createdAt: async ({ id, select }, _, { dataSources: { prisma } }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: select as { createdAt: true },
      });

      return user.createdAt;
    },
    updatedAt: async ({ id, select }, _, { dataSources: { prisma } }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: select as { updatedAt: true },
      });

      return user.updatedAt;
    },
    name: async ({ id, select }, _, { dataSources: { prisma } }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: select as { name: true },
      });

      return user.name;
    },
    email: async ({ id, select }, _, { dataSources: { prisma } }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: select as { email: true },
      });

      return user.email;
    },
    token: async ({ id, select }, _, { dataSources: { prisma } }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
        select: select as { token: true },
      });

      return user.token;
    },
  },
};
