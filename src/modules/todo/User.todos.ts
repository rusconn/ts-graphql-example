import { findManyCursorConnection } from "@devoxa/prisma-relay-cursor-connection";

import * as Prisma from "@/prisma";
import { parseConnectionArgs, ParseError } from "../common/parsers";
import { full } from "../common/resolvers";
import { UserResolvers, UserTodosArgs, OrderDirection, TodoOrderField } from "../common/schema";
import { cursorConnections, orderOptions } from "../common/typeDefs";
import { isAdminOrUserOwner } from "./common/authorizer";

export const typeDef = /* GraphQL */ `
  extend type User {
    todos(
      "max: 50"
      first: Int
      after: String
      "max: 50"
      last: Int
      before: String
      orderBy: TodoOrder! = { field: UPDATED_AT, direction: DESC }
    ): TodoConnection
  }

  ${orderOptions("Todo")}
  ${cursorConnections("Todo", { totalCount: "Int!" })}
`;

export const resolver: UserResolvers["todos"] = async (parent, args, context, resolveInfo) => {
  authorizer(context.user, parent);

  const { first, last, before, after, orderBy } = parser(args);

  return findManyCursorConnection(
    async findManyArgs =>
      context.prisma.todo
        .findMany({
          ...findManyArgs,
          where: { userId: parent.id },
          orderBy,
        })
        .then(todos => todos.map(full)),
    () => context.prisma.todo.count({ where: { userId: parent.id } }),
    { first, last, before, after },
    { resolveInfo }
  );
};

export const authorizer = isAdminOrUserOwner;

export const parser = (args: UserTodosArgs) => {
  const { orderBy, ...connectionArgs } = args;

  const { first, last, before, after } = parseConnectionArgs(connectionArgs);

  if (first == null && last == null) {
    throw new ParseError("`first` or `last` value required");
  }
  if (first && first > 50) {
    throw new ParseError("`first` must be up to 50");
  }
  if (last && last > 50) {
    throw new ParseError("`last` must be up to 50");
  }

  const firstToUse = first == null && last == null ? 20 : first;

  const directionToUse =
    orderBy.direction === OrderDirection.Asc
      ? Prisma.Prisma.SortOrder.asc
      : Prisma.Prisma.SortOrder.desc;

  const orderByToUse =
    orderBy.field === TodoOrderField.CreatedAt
      ? [{ createdAt: directionToUse }, { id: directionToUse }]
      : [{ updatedAt: directionToUse }, { id: directionToUse }];

  return { first: firstToUse, last, before, after, orderBy: orderByToUse };
};
