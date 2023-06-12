import { Graph, TypeDef } from "@/graphql/types";

const sep = ":";

export const toSpecifiedNodeId =
  <T extends TypeDef.NodeType>(type: T) =>
  (id: string) =>
    `${type}${sep}${id}` as const;

export const splitSpecifiedNodeId =
  <T extends TypeDef.NodeType>(nodeType: T) =>
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

  if (!TypeDef.isValidNodeType(type) || id == null || id === "" || rest.length !== 0) {
    throw new TypeError(`invalid node id: ${nodeId}`);
  }

  return { type, id };
};
