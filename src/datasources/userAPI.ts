import { Prisma, PrismaClient, Role, User } from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import { nanoid } from "nanoid";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import { prisma } from "./internal/prisma";

export { Role, type User };
export const UserSortOrder = Prisma.SortOrder;

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
  role?: User["role"];
};

export type CreateManyUserParams = CreateUserParams[];

export type CreateManyUserForTestParams = (CreateUserParams & {
  id?: User["id"];
  token?: User["token"];
  createdAt?: User["createdAt"];
  updatedAt?: User["updatedAt"];
})[];

export type UpdateUserParams = {
  id: User["id"];
  name?: User["name"];
  token?: User["token"];
  role?: User["role"];
};

export type UpsertUserParams = CreateUserParams & {
  id: User["id"];
  token?: User["token"];
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

  async gets({ info, orderBy, first, last, before, after }: GetUsersParams) {
    return findManyCursorConnection<User>(
      args => this.prisma.user.findMany({ ...args, orderBy }),
      () => this.prisma.user.count(),
      { first, last, before, after },
      { resolveInfo: info }
    );
  }

  async get({ id }: GetUserParams) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async getOptional({ id }: GetUserParams) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async getByToken({ token }: GetUserByTokenParams) {
    return this.prisma.user.findUnique({ where: { token } });
  }

  async create({ name, role }: CreateUserParams) {
    return this.prisma.user.create({ data: { id: nanoid(), name, token: nanoid(), role } });
  }

  async createMany(params: CreateManyUserParams) {
    const data = params.map(({ name, role }) => ({ id: nanoid(), name, token: nanoid(), role }));

    return this.prisma.user.createMany({ data });
  }

  async createManyForTest(params: CreateManyUserForTestParams) {
    const data = params.map(({ id, name, token, role, createdAt, updatedAt }) => ({
      id: id ?? nanoid(),
      name,
      token: token ?? nanoid(),
      role,
      createdAt,
      updatedAt,
    }));

    return this.prisma.user.createMany({ data });
  }

  async update({ id, name, token, role }: UpdateUserParams) {
    return this.prisma.user.update({ where: { id }, data: { name, token, role } });
  }

  async upsert({ id, name, token, role }: UpsertUserParams) {
    const user = { id, name, token: token ?? nanoid(), role };

    return this.prisma.user.upsert({ where: { id: user.id }, create: user, update: user });
  }

  async delete({ id }: DeleteUserParams) {
    return this.prisma.user.delete({ where: { id } });
  }

  async deleteAll() {
    return this.prisma.user.deleteMany();
  }
}
