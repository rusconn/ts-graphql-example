import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";
import bcrypt from "bcrypt";
import { ulid } from "ulid";

import { passwordHashRoundsExponent } from "@/config";
import * as Prisma from "@/prisma";
import type * as Graph from "../common/schema";
import { Full, full, isFull } from "../common/resolvers";
import { adapters } from "./adapters";
import { authorizers } from "./authorizers";
import { parsers } from "./parsers";

const fullUser = async (prisma: Prisma.PrismaClient, parent: User) => {
  return isFull(parent)
    ? parent
    : prisma.user.findUniqueOrThrow({
        where: { id: parent.id },
      });
};

export type User = Pick<Prisma.User, "id"> | Full<Prisma.User>;

export const resolvers: Graph.Resolvers = {
  Query: {
    me: (_, __, { user }) => {
      const authed = authorizers.Query.me(user);

      return full(authed);
    },
    users: async (_, args, { prisma, user }, resolveInfo) => {
      authorizers.Query.users(user);

      const { orderBy, first, last, before, after } = parsers.Query.users(args);

      return findManyCursorConnection(
        findManyArgs =>
          prisma.user
            .findMany({
              ...findManyArgs,
              orderBy,
            })
            .then(users => users.map(full)),
        () => prisma.user.count(),
        { first, last, before, after },
        { resolveInfo }
      );
    },
    user: (_, args, { user }) => {
      authorizers.Query.user(user);

      const { id } = parsers.Query.user(args);

      return { id };
    },
  },
  Mutation: {
    signup: async (_, args, { prisma, user, logger }) => {
      const authed = authorizers.Mutation.signup(user);

      const { password, ...data } = parsers.Mutation.signup(args);

      try {
        const signed = await prisma.user.create({
          data: {
            ...data,
            id: authed.id,
            password: bcrypt.hashSync(password, passwordHashRoundsExponent),
            token: ulid(),
          },
          select: { id: true },
        });

        return {
          __typename: "SignupSuccess",
          id: adapters.User.id(signed.id),
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
    login: async (_, args, { prisma, user, logger }) => {
      authorizers.Mutation.login(user);

      const { email, password } = parsers.Mutation.login(args);

      try {
        const found = await prisma.user.findUniqueOrThrow({
          where: { email },
          select: { password: true },
        });

        if (!bcrypt.compareSync(password, found.password)) {
          throw new Prisma.NotExistsError();
        }

        const refreshed = await prisma.user.update({
          where: { email },
          data: { token: ulid() },
        });

        return {
          __typename: "LoginSuccess",
          user: full(refreshed),
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
      const authed = authorizers.Mutation.logout(contextUser);

      const user = await prisma.user.update({
        where: { id: authed.id },
        data: { token: null },
      });

      return {
        __typename: "LogoutSuccess",
        user: full(user),
      };
    },
    updateMe: async (_, args, { prisma, user: contextUser, logger }) => {
      const authed = authorizers.Mutation.updateMe(contextUser);

      const data = parsers.Mutation.updateMe(args);

      try {
        const user = await prisma.user.update({
          where: { id: authed.id },
          data,
        });

        return {
          __typename: "UpdateMeSuccess",
          user: full(user),
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
      const authed = authorizers.Mutation.deleteMe(user);

      const deletedUser = await prisma.user.delete({
        where: { id: authed.id },
        select: { id: true },
      });

      return {
        __typename: "DeleteMeSuccess",
        id: adapters.User.id(deletedUser.id),
      };
    },
  },
  User: {
    id: async (parent, _, { prisma, user: contextUser }) => {
      authorizers.User.id(contextUser, parent.id);

      const user = await fullUser(prisma, parent);

      return adapters.User.id(user.id);
    },
    createdAt: async (parent, _, { prisma, user: contextUser }) => {
      authorizers.User.createdAt(contextUser, parent.id);

      const user = await fullUser(prisma, parent);

      return user.createdAt;
    },
    updatedAt: async (parent, _, { prisma, user: contextUser }) => {
      authorizers.User.updatedAt(contextUser, parent.id);

      const user = await fullUser(prisma, parent);

      return user.updatedAt;
    },
    name: async (parent, _, { prisma, user: contextUser }) => {
      authorizers.User.name(contextUser, parent.id);

      const user = await fullUser(prisma, parent);

      return user.name;
    },
    email: async (parent, _, { prisma, user: contextUser }) => {
      authorizers.User.email(contextUser, parent.id);

      const user = await fullUser(prisma, parent);

      return user.email;
    },
    token: async (parent, _, { prisma, user: contextUser }) => {
      authorizers.User.token(contextUser, parent.id);

      const user = await fullUser(prisma, parent);

      return user.token;
    },
  },
};
