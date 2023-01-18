import type { Prisma, PrismaClient, User } from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import { nanoid } from "nanoid";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import { prisma } from "./internal/prisma";

export type GetUsersParams = ConnectionArguments & {
  orderBy: Exclude<Prisma.UserFindManyArgs["orderBy"], undefined>;
  info: GraphQLResolveInfo;
};

export type GetUserParams = {
  id: User["id"];
};

export type GetUserByTokenParams = {
  token: User["token"];
};

export type CreateUserParams = {
  name: User["name"];
};

export type CreateManyUserParams = (CreateUserParams & {
  id: User["id"];
  token: User["token"];
})[];

export type UpdateUserParams = {
  id: User["id"];
  name?: User["name"];
};

export type UpsertUserParams = CreateUserParams & {
  id: User["id"];
  token: User["token"];
};

export type DeleteUserParams = {
  id: User["id"];
};

export class UserAPI {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async count() {
    return this.prisma.user.count();
  }

  async gets({ info, orderBy, ...paginationArgs }: GetUsersParams) {
    return findManyCursorConnection<User>(
      args => this.prisma.user.findMany({ ...args, orderBy }),
      () => this.prisma.user.count(),
      paginationArgs,
      { resolveInfo: info }
    );
  }

  async get({ id }: GetUserParams) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async getByToken({ token }: GetUserByTokenParams) {
    return this.prisma.user.findUnique({ where: { token } });
  }

  async create(data: CreateUserParams) {
    return this.prisma.user.create({ data: { id: nanoid(), token: nanoid(), ...data } });
  }

  async createMany(data: CreateManyUserParams) {
    return this.prisma.user.createMany({ data });
  }

  async update({ id, ...data }: UpdateUserParams) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async upsert(user: UpsertUserParams) {
    return this.prisma.user.upsert({ where: { id: user.id }, create: user, update: user });
  }

  async delete({ id }: DeleteUserParams) {
    return this.prisma.user.delete({ where: { id } });
  }

  async deleteAll() {
    return this.prisma.user.deleteMany();
  }
}
