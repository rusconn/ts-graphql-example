export const PageInfoTypeDefinition = /* GraphQL */ `
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

export const cursorConnection = ({
  nodeType,
  edgeType = nodeType,
  additionals: {
    //
    connectionFields = {},
    edgeFields = {},
  } = {},
}: {
  nodeType: string;
  edgeType?: string;
  additionals?: {
    connectionFields?: Record<string, string>;
    edgeFields?: Record<string, string>;
  };
}) => /* GraphQL */ `
    type ${edgeType}Connection {
      pageInfo: PageInfo!
      edges: [${edgeType}Edge]
      nodes: [${nodeType}]
      ${fieldLines(connectionFields)}
    }

    type ${edgeType}Edge {
      node: ${nodeType}
      cursor: String!
      ${fieldLines(edgeFields)}
    }
  `;

const fieldLines = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(([name, type]) => `${name}: ${type}`)
    .join("\n");
