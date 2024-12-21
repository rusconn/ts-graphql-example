export type Params = {
  nodeType: string;
  edgeType?: string;
  additionals?: {
    connectionFields?: Record<string, string>;
    edgeFields?: Record<string, string>;
  };
};

export const cursorConnection = ({ nodeType, edgeType = nodeType, additionals }: Params) => {
  const connectionFields = additionals?.connectionFields ?? {};
  const edgeFields = additionals?.edgeFields ?? {};

  return `
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
};

const fieldLines = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(([name, type]) => `${name}: ${type}`)
    .join("\n");
