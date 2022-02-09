export const todoType = "Todo";
export const userType = "User";

export const nodeTypes = [todoType, userType] as const;

export type NodeType = typeof nodeTypes[number];
