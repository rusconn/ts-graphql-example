import type { Connection } from "@devoxa/prisma-relay-cursor-connection";

export const toSchemaConnections =
  <T, U>(toSchemaType: (_: T) => U) =>
  (connection: Connection<T>) => ({
    ...connection,
    edges: connection.edges.map(edge => ({ ...edge, node: toSchemaType(edge.node) })),
    nodes: connection.nodes.map(toSchemaType),
  });
