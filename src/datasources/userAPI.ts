import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import type { User } from "@/types";
import { toUserNodeId, toUserId, mapConnectionIds } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { NotFoundError } from "./errors";

export type GetUsersParams = ConnectionArguments & {
  orderBy: Exclude<Prisma.Prisma.UserFindManyArgs["orderBy"], undefined>;
  info: GraphQLResolveInfo;
};

export type GetUserParams = {
  nodeId: User["id"];
};

export type CreateUserParams = {
  name: User["name"];
};

export type UpdateUserParams = {
  nodeId: User["id"];
  name?: User["name"];
};

export type DeleteUserParams = {
  nodeId: User["id"];
};

export class UserAPI extends PrismaDataSource {
  @catchPrismaError
  async gets({ info, orderBy, ...paginationArgs }: GetUsersParams) {
    const result = await findManyCursorConnection<Prisma.User, Pick<Prisma.User, "id">>(
      args => this.prisma.user.findMany({ ...args, orderBy }),
      () => this.prisma.user.count(),
      paginationArgs,
      {
        getCursor: record => ({ id: record.id }),
        encodeCursor: ({ id }) => toUserNodeId(id),
        decodeCursor: cursor => ({ id: toUserId(cursor) }),
        resolveInfo: info,
      }
    );

    return mapConnectionIds(result, toUserNodeId);
  }

  @catchPrismaError
  async get({ nodeId }: GetUserParams) {
    const id = toUserId(nodeId);
    const result = await this.prisma.user.findUnique({ where: { id } });

    if (!result) {
      throw new NotFoundError("Not found");
    }

    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async create(data: CreateUserParams) {
    const result = await this.prisma.user.create({ data });
    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async update({ nodeId, ...data }: UpdateUserParams) {
    const id = toUserId(nodeId);

    const result = await this.prisma.user.update({
      where: { id },
      data,
    });

    return { ...result, id: toUserNodeId(result.id) };
  }

  @catchPrismaError
  async delete({ nodeId }: DeleteUserParams) {
    const id = toUserId(nodeId);
    const result = await this.prisma.user.delete({ where: { id } });
    return { ...result, id: toUserNodeId(result.id) };
  }
}
