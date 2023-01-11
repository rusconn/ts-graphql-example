import type { Connection } from "@devoxa/prisma-relay-cursor-connection";

export const toGraphConnections =
  <T, U>(toNode: (_: T) => U) =>
  (connection: Connection<T>) => ({
    ...connection,
    edges: connection.edges.map(edge => ({ ...edge, node: toNode(edge.node) })),
    nodes: connection.nodes.map(toNode),
  });
