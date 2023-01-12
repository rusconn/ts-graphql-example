import * as Prisma from "@prisma/client";

import { Graph, Mapper } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";
import { splitSpecifiedNodeId, toSpecifiedNodeId } from "./node";
import { toGraphConnections } from "./utils";

export const toUserNodeId = toSpecifiedNodeId("User");
export const splitUserNodeId = splitSpecifiedNodeId("User");

export const toUserNode = (user: Prisma.User): Mapper.User => ({
  ...user,
  id: toUserNodeId(user.id),
  name: nonEmptyString(user.name),
  token: nonEmptyString(user.token),
  role: {
    [Prisma.Role.ADMIN]: Graph.Role.Admin,
    [Prisma.Role.USER]: Graph.Role.User,
    [Prisma.Role.GUEST]: Graph.Role.Guest,
  }[user.role],
});

export const toUserNodes = toGraphConnections(toUserNode);
