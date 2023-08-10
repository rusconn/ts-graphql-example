export const nodeTypes = ["Todo", "User"] as const;

export type NodeType = typeof nodeTypes[number];

export const typeIdSep = ":";

export const cursorConnections = (
  type: NodeType,
  additionalConnectionFields: Record<string, string> = {},
  additionalEdgeFields: Record<string, string> = {}
) => `
  type ${type}Connection {
    pageInfo: PageInfo!
    edges: [${type}Edge!]!
    nodes: [${type}!]!
    ${fieldLines(additionalConnectionFields)}
  }

  type ${type}Edge {
    node: ${type}!
    cursor: String!
    ${fieldLines(additionalEdgeFields)}
  }
`;

export const orderOptions = (
  type: NodeType,
  additionaOrderFields: Record<string, string> = {},
  additionalOrderFieldFields: Record<string, string> = {}
) => `
  input ${type}Order {
    field: ${type}OrderField!
    direction: OrderDirection!
    ${fieldLines(additionaOrderFields)}
  }

  enum ${type}OrderField {
    CREATED_AT
    UPDATED_AT
    ${fieldLines(additionalOrderFieldFields)}
  }
`;

const fieldLines = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(([name, type]) => `${name}: ${type}`)
    .join("\n");
