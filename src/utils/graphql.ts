import { DocumentNode, getOperationAST } from "graphql";
import { gql } from "apollo-server";

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
