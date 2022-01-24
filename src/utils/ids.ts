import type { Connection } from "@devoxa/prisma-relay-cursor-connection";

import type { NodeType } from "@/types";
import { BaseError } from "@/errors";
import { isValidNodeType } from "./type";

const typeIdSeparator = ":";

/**
 * for node interface
 * @param nodeId `"{Type}:{id}"`
 * @throws BaseError - if param is invalid
 */
export const fromNodeId = (nodeId: string) => {
  const splitted = nodeId.split(typeIdSeparator);

  if (splitted.length !== 2) {
    throw new BaseError("invalid input");
  }

  const [maybeType, maybeStrId] = splitted;

  if (!isValidNodeType(maybeType)) {
    throw new BaseError("invalid input");
  }

  const maybeId = Number(maybeStrId);

  if (maybeId < 1 || 2 ** 31 - 1 < maybeId || Number.isNaN(maybeId)) {
    throw new BaseError("invalid input");
  }

  return { type: maybeType, id: maybeId };
};

/** ("User", "1" | 1) → "User:1" */
const toNodeId = (type: NodeType) => (dbId: string | number) =>
  [type, `${dbId}`].join(typeIdSeparator);

/** "{Type}" → "{Type}:{id}" → id */
const toId = (expectedType: NodeType) => (nodeId: string) => {
  const { type, id } = fromNodeId(nodeId);

  if (type !== expectedType) {
    throw new BaseError("invalid input");
  }

  return id;
};

export const toUserNodeId = toNodeId("User");
export const toTodoNodeId = toNodeId("Todo");
export const toUserId = toId("User");
export const toTodoId = toId("Todo");

export const mapConnectionIds = <T extends { id: number }>(
  connection: Connection<T>,
  mapper: (id: number) => string
) => ({
  ...connection,
  edges: connection.edges.map(edge => ({
    ...edge,
    node: {
      ...edge.node,
      id: mapper(edge.node.id),
    },
  })),
});

/* eslint-disable no-void */
export const assertIsNodeId = (x: string) => void fromNodeId(x);
export const assertIsUserNodeId = (x: string) => void toUserId(x);
export const assertIsTodoNodeId = (x: string) => void toTodoId(x);
