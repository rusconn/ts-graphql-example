import { DocumentNode, getOperationAST } from "graphql";
import { gql } from "apollo-server";

import type { NodeType } from "@/types";

// https://spectrum.chat/apollo/apollo-server/how-to-detect-introspection-query~432197c6-549a-467d-bdca-9083a98406aa
// https://github.com/justinlevi/typorm-issue/blob/eb92b31a581f963707abdea26c49c9893fdb9a86/src/plugins/apolloServerRequestLogger.ts#L18
export const isIntrospectionQuery = (query: string | DocumentNode) => {
  const document = typeof query === "string" ? gql(query) : query;
  const operation = getOperationAST(document);

  return (
    operation != null &&
    operation.selectionSet.selections.every(
      selection => ((selection as any).name.value as string).startsWith("__") // eslint-disable-line
    )
  );
};

export const makeCursorConnections = (
  type: NodeType,
  additionalConnectionFields: Record<string, string> = {},
  additionalEdgeFields: Record<string, string> = {}
) => `
  type ${type}Connection {
    pageInfo: PageInfo!
    edges: [${type}Edge!]!
    ${toFieldLines(additionalConnectionFields)}
  }

  type ${type}Edge {
    node: ${type}!
    cursor: String!
    ${toFieldLines(additionalEdgeFields)}
  }
`;

const toFieldLines = (fields: Record<string, string>) =>
  Object.entries(fields)
    .map(([name, type]) => `${name}: ${type}`)
    .join("\n");
