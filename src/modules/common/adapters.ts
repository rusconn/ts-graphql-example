import type { ID } from "../scalar/_mod.ts";

export type NodeType = (typeof nodeTypes)[number];

export const nodeTypes = ["Todo", "User"] as const;

export const typeIdSep = ":";

export const nodeId =
  <T extends NodeType>(type: T) =>
  (id: string) =>
    `${type}${typeIdSep}${id}` as ID;
