import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import type { User } from "@/types";
import { userId } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { NotFoundError } from "./errors";

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

export class UserAPI extends PrismaDataSource {
  @catchPrismaError
  gets({ info, orderBy, ...paginationArgs }: GetUsersParams) {
    return findManyCursorConnection<Prisma.User>(
      args => this.prisma.user.findMany({ ...args, orderBy }),
      () => this.prisma.user.count(),
      paginationArgs,
      { resolveInfo: info }
    );
  }

  @catchPrismaError
  async get({ id }: GetUserParams) {
    const result = await this.prisma.user.findUnique({ where: { id } });

    if (!result) {
      throw new NotFoundError("Not found");
    }

    return result;
  }

  @catchPrismaError
  create(data: CreateUserParams) {
    return this.prisma.user.create({ data: { id: userId(), ...data } });
  }

  @catchPrismaError
  update({ id, ...data }: UpdateUserParams) {
    return this.prisma.user.update({ where: { id }, data });
  }

  @catchPrismaError
  delete({ id }: DeleteUserParams) {
    return this.prisma.user.delete({ where: { id } });
  }
}
