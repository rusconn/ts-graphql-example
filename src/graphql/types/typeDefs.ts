const nodeTypes = ["Todo", "User"] as const;

export type NodeType = typeof nodeTypes[number];

export const isValidNodeType = (val: string): val is NodeType =>
  nodeTypes.includes(val as NodeType);
