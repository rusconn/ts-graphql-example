import type { Graph } from "@/graphql/types";

const nodeTypes = ["Todo", "User"] as const;

export type NodeType = typeof nodeTypes[number];

const sep = ":";

export const toSpecifiedNodeId =
  (type: NodeType) =>
  (id: string): Graph.Scalars["ID"] =>
    `${type}${sep}${id}`;

export const splitSpecifiedNodeId =
  <T extends NodeType>(nodeType: T) =>
  (nodeId: Graph.Node["id"]) => {
    const { type, id } = splitNodeId(nodeId);

    if (type !== nodeType) {
      throw new TypeError(`invalid node id: ${nodeId}`);
    }

    return { type, id } as T extends "Todo"
      ? { type: "Todo"; id: string }
      : { type: "User"; id: string };
  };

export const splitNodeId = (nodeId: Graph.Node["id"]) => {
  const [type, id, ...rest] = nodeId.split(sep);

  if (!isValidNodeType(type) || id == null || id === "" || rest.length !== 0) {
    throw new TypeError(`invalid node id: ${nodeId}`);
  }

  return { type, id };
};

const isValidNodeType = (val: string): val is NodeType => nodeTypes.includes(val as NodeType);
