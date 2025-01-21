import type { ID } from "../ID.ts";

export type NodeType = (typeof nodeTypes)[number];

export const nodeTypes = ["Post", "User"] as const;

export const typeIdSep = ":";

export const nodeId =
  <T extends NodeType>(type: T) =>
  (id: string) =>
    `${type}${typeIdSep}${id}` as ID;
