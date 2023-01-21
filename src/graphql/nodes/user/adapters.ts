import type * as DataSource from "@/datasources";
import type { Mapper } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";
import { splitSpecifiedNodeId, toSpecifiedNodeId } from "../node";

export const toUserNodeId = toSpecifiedNodeId("User");
export const splitUserNodeId = splitSpecifiedNodeId("User");

export const toUserNode = ({ role: _role, ...user }: DataSource.User): Mapper.User => ({
  ...user,
  id: toUserNodeId(user.id),
  name: nonEmptyString(user.name),
  token: nonEmptyString(user.token),
});
