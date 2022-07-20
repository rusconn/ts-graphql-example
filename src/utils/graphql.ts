import { DocumentNode, getOperationAST } from "graphql";
import { gql } from "apollo-server";

import type { Type } from "./ids";

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
  type: Type,
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

export const makeOrderOptions = (
  type: Type,
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
