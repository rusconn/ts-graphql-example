import type { NodeType } from "@/adapters";

export const makeCursorConnections = (
  type: NodeType,
  additionalConnectionFields: Record<string, string> = {},
  additionalEdgeFields: Record<string, string> = {}
) => `
  type ${type}Connection {
    pageInfo: PageInfo!
    edges: [${type}Edge!]!
    nodes: [${type}!]!
    ${toFieldLines(additionalConnectionFields)}
  }

  type ${type}Edge {
    node: ${type}!
    cursor: String!
    ${toFieldLines(additionalEdgeFields)}
  }
`;

export const makeOrderOptions = (
  type: NodeType,
  additionaOrderFields: Record<string, string> = {},
  additionalOrderFieldFields: Record<string, string> = {}
) => `
  input ${type}Order {
    field: ${type}OrderField!
    direction: OrderDirection!
    ${toFieldLines(additionaOrderFields)}
  }

  enum ${type}OrderField {
    CREATED_AT
    UPDATED_AT
    ${toFieldLines(additionalOrderFieldFields)}
  }
`;

const toFieldLines = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(([name, type]) => `${name}: ${type}`)
    .join("\n");
