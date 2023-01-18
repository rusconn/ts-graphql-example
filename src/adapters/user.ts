import * as DataSource from "@/datasources";
import { Graph, Mapper } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";
import { splitSpecifiedNodeId, toSpecifiedNodeId } from "./node";
import { toGraphConnections } from "./utils";

export const toUserNodeId = toSpecifiedNodeId("User");
export const splitUserNodeId = splitSpecifiedNodeId("User");

export const toUserNode = (user: DataSource.User): Mapper.User => ({
  ...user,
  id: toUserNodeId(user.id),
  name: nonEmptyString(user.name),
  token: nonEmptyString(user.token),
  role: {
    [DataSource.Role.ADMIN]: Graph.Role.Admin,
    [DataSource.Role.USER]: Graph.Role.User,
  }[user.role],
});

export const toUserNodes = toGraphConnections(toUserNode);
