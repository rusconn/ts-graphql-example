import * as Prisma from "@prisma/client";

import { Graph, Mapper } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";
import { toGraphConnections } from "./utils";

export const toUserNode = (user: Prisma.User): Mapper.User => ({
  ...user,
  name: nonEmptyString(user.name),
  token: nonEmptyString(user.token),
  role: {
    [Prisma.Role.ADMIN]: Graph.Role.Admin,
    [Prisma.Role.USER]: Graph.Role.User,
    [Prisma.Role.GUEST]: Graph.Role.Guest,
  }[user.role],
});

export const toUserNodes = toGraphConnections(toUserNode);
