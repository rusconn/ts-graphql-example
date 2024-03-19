import type { SetRequired } from "type-fest";

import * as Prisma from "@/prisma/mod.ts";
import {
  type Context,
  notFoundErr,
  selectColumns as selectColumnsCommon,
} from "../../common/resolvers.ts";
import type * as Graph from "../../common/schema.ts";

export type User = SetRequired<Partial<Prisma.User>, "id">;

export const getUser = async (
  context: Pick<Context, "prisma">,
  key: Pick<User, "id">,
  select?: ReturnType<typeof selectColumns>,
) => {
  const user = await context.prisma.user.findUnique({
    where: { id: key.id },
    select,
  });

  if (!user) {
    throw notFoundErr();
  }

  return user;
};

const fieldColumnMap: Partial<Record<keyof Graph.User, keyof Prisma.User>> = {
  name: "name",
  email: "email",
  token: "token",
};

const requiredColumns = ["id"] as const;

export const selectColumns = selectColumnsCommon<
  Graph.User,
  Prisma.User,
  (typeof requiredColumns)[number]
>(fieldColumnMap, requiredColumns);
