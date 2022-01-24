export const nodeTypes = ["Todo", "User"] as const;

export type NodeType = typeof nodeTypes[number];
