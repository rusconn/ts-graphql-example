import { BaseError } from "@/errors";

const nodeTypes = ["Todo", "User"] as const;

export type NodeType = typeof nodeTypes[number];

const sep = ":";

export const toSpecifiedNodeId = (type: NodeType) => (id: string) => `${type}${sep}${id}`;

type Splitted<T> = { type: T; id: string };

export const splitSpecifiedNodeId =
  <T extends NodeType>(nodeType: T) =>
  (nodeId: string): T extends "Todo" ? Splitted<"Todo"> : Splitted<"User"> => {
    const { type, id } = splitNodeId(nodeId);

    if (type !== nodeType) {
      throw new BaseError(`invalid node id: ${nodeId}`);
    }

    if (type === "Todo") {
      return <T extends "Todo" ? Splitted<"Todo"> : Splitted<"User">>{ type, id };
    }

    return <T extends "Todo" ? Splitted<"Todo"> : Splitted<"User">>{ type, id };
  };

export const splitNodeId = (nodeId: string) => {
  const [type, id, ...rest] = nodeId.split(sep);

  if (!isValidNodeType(type) || id == null || id === "" || rest.length !== 0) {
    throw new BaseError(`invalid node id: ${nodeId}`);
  }

  return { type, id };
};

const isValidNodeType = (val: string): val is NodeType => nodeTypes.includes(val as NodeType);
