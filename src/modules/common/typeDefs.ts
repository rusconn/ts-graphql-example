export const nodeTypes = ["Todo", "User"] as const;

export type NodeType = (typeof nodeTypes)[number];

export const typeIdSep = ":";

export const cursorConnection = ({
  nodeType,
  edgeType = nodeType,
  additionals,
}: {
  nodeType: NodeType;
  edgeType?: string;
  additionals?: {
    connectionFields?: Record<string, string>;
    edgeFields?: Record<string, string>;
  };
}) => {
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
