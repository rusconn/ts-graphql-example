import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config";
import * as Prisma from "@/prisma";
import type * as Graph from "../common/schema";
import { adapters } from "./adapters";
import { parsers } from "./parsers";

export type User = Pick<Prisma.User, "id">;

export const resolvers: Graph.Resolvers = {
  Query: {
    me: (_, __, { user }) => {
      return { id: user.id };
    },
    users: async (_, args, { prisma }, resolveInfo) => {
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
    user: (_, args) => {
      const { id } = parsers.Query.user(args);

      return { id };
    },
  },
  Mutation: {
    signup: async (_, args, { prisma, logger }) => {
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
        if (e instanceof Prisma.NotUniqueError) {
          logger.error(e, "error info");

          return {
            __typename: "EmailAlreadyTakenError",
            message: "specified email already taken",
          };
        }

        throw e;
      }
    },
    login: async (_, args, { prisma, logger }) => {
      const { email, password } = parsers.Mutation.login(args);

      try {
        const user = await prisma.user.findUniqueOrThrow({
          where: { email },
          select: { password: true },
        });

        if (!bcrypt.compareSync(password, user.password)) {
          throw new Prisma.NotExistsError();
        }

        const refreshedUser = await prisma.user.update({
          where: { email },
          data: { token: ulid() },
          select: { id: true },
        });

        return {
          __typename: "LoginSuccess",
          user: refreshedUser,
        };
      } catch (e) {
        if (e instanceof Prisma.NotExistsError) {
          logger.error(e, "error info");

          return {
            __typename: "UserNotFoundError",
            message: "user not found",
          };
        }

        throw e;
      }
    },
    logout: async (_, __, { prisma, user: contextUser }) => {
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
    updateMe: async (_, args, { prisma, user: contextUser, logger }) => {
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
        if (e instanceof Prisma.NotUniqueError) {
          logger.error(e, "error info");

          return {
            __typename: "EmailAlreadyTakenError",
            message: "specified email already taken",
          };
        }

        throw e;
      }
    },
    deleteMe: async (_, __, { prisma, user }) => {
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
    id: async ({ id }, _, { prisma }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return adapters.User.id(user.id);
    },
    createdAt: async ({ id }, _, { prisma }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return user.createdAt;
    },
    updatedAt: async ({ id }, _, { prisma }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return user.updatedAt;
    },
    name: async ({ id }, _, { prisma }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return user.name;
    },
    email: async ({ id }, _, { prisma }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return user.email;
    },
    token: async ({ id }, _, { prisma }) => {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return user.token;
    },
  },
};
