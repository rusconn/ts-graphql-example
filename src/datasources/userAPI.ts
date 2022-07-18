import type * as Prisma from "@prisma/client";
import type { GraphQLResolveInfo } from "graphql";
import {
  ConnectionArguments,
  findManyCursorConnection,
} from "@devoxa/prisma-relay-cursor-connection";

import { OrderDirection, User, UserOrderField } from "@/types";
import { toUserNodeId, toUserId, mapConnectionIds } from "@/utils";
import { PrismaDataSource } from "./abstracts";
import { catchPrismaError } from "./decorators";
import { DataSourceError, NotFoundError, ValidationError } from "./errors";

export type GetUsersParams = ConnectionArguments & {
  orderBy?: {
    field: UserOrderField;
    direction: OrderDirection;
  } | null;
  info: GraphQLResolveInfo;
};

export type GetUserParams = {
  nodeId: User["id"];
};

export type GetUserByDbIdParams = {
  id: Prisma.User["id"];
};

export type CreateUserParams = {
  name: User["name"];
};

export type UpdateUserParams = {
  nodeId: User["id"];
  name?: User["name"] | null; // TODO: | null を消す
};

export type DeleteUserParams = {
  nodeId: User["id"];
};

export class UserAPI extends PrismaDataSource {
  async gets(params: GetUsersParams) {
    try {
      return await this.getsCore(params);
    } catch (e) {
      // 多分 findManyCursorConnection のバリデーションエラー
      if (!(e instanceof DataSourceError) && e instanceof Error) {
        throw new ValidationError(e.message, e);
      }

      throw e;
    }
  }

  @catchPrismaError
  private async getsCore({ info, orderBy, ...paginationArgs }: GetUsersParams) {
    const defaultedPaginationArgs =
      paginationArgs.first == null && paginationArgs.last == null
        ? { ...paginationArgs, first: 10 }
        : paginationArgs;

    const directionToUse = orderBy?.direction === OrderDirection.Asc ? "asc" : "desc";

    const orderByToUse: Exclude<Prisma.Prisma.UserFindManyArgs["orderBy"], undefined> =
      orderBy?.field === UserOrderField.UpdatedAt
        ? [{ updatedAt: directionToUse }, { id: directionToUse }]
        : { id: directionToUse };

    const result = await findManyCursorConnection<Prisma.User, Pick<Prisma.User, "id">>(
      args => this.prisma.user.findMany({ ...args, orderBy: orderByToUse }),
      () => this.prisma.user.count(),
      defaultedPaginationArgs,
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
  get({ nodeId }: GetUserParams) {
    const id = toUserId(nodeId);
    return this.getByDbId({ id });
  }

  @catchPrismaError
  async getByDbId({ id }: GetUserByDbIdParams) {
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
      data: { name: data.name ?? undefined }, // TODO: ?? undefined を消す
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
