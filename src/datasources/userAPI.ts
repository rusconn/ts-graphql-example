import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import type { User } from "@/types";
import { userId } from "@/utils";

export type GetUsersParams = ConnectionArguments & {
  orderBy: Exclude<Prisma.Prisma.UserFindManyArgs["orderBy"], undefined>;
  info: GraphQLResolveInfo;
};

export type GetUserParams = {
  id: User["id"];
};

export type CreateUserParams = {
  name: User["name"];
};

export type UpdateUserParams = {
  id: User["id"];
  name?: User["name"];
};

export type DeleteUserParams = {
  id: User["id"];
};

export class UserAPI {
  constructor(private prisma: Prisma.PrismaClient) {}

  async gets({ info, orderBy, ...paginationArgs }: GetUsersParams) {
    return findManyCursorConnection<Prisma.User>(
      args => this.prisma.user.findMany({ ...args, orderBy }),
      () => this.prisma.user.count(),
      paginationArgs,
      { resolveInfo: info }
    );
  }

  async get({ id }: GetUserParams) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  async create(data: CreateUserParams) {
    return this.prisma.user.create({ data: { id: userId(), ...data } });
  }

  async update({ id, ...data }: UpdateUserParams) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete({ id }: DeleteUserParams) {
    return this.prisma.user.delete({ where: { id } });
  }
}
