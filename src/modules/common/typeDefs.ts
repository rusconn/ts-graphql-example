export const nodeTypes = ["Todo", "User"] as const;

export type NodeType = (typeof nodeTypes)[number];

export const typeIdSep = ":";

export const cursorConnections = (
  type: NodeType,
  additionalConnectionFields: Record<string, string> = {},
  additionalEdgeFields: Record<string, string> = {},
) => `
  type ${type}Connection {
    pageInfo: PageInfo!
    edges: [${type}Edge]
    nodes: [${type}]
    ${fieldLines(additionalConnectionFields)}
  }

  type ${type}Edge {
    node: ${type}
    cursor: String!
    ${fieldLines(additionalEdgeFields)}
  }
`;

const fieldLines = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(([name, type]) => `${name}: ${type}`)
    .join("\n");
