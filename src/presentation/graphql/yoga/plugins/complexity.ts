import type { DocumentNode } from "graphql";
import { getComplexity } from "graphql-query-complexity";
import type { Plugin } from "graphql-yoga";

import { maxComplexity } from "../../../../config/graphql-security.ts";
import { queryTooComplexError } from "../../schema/_errors/global/query-too-complex.ts";
import type { PluginContext } from "../context.ts";
import { complexityEstimators } from "./complexity/estimators.ts";

// parse cacheが同じDocumentNodeインスタンスを再利用するため、2回目以降は計算をスキップできる。
// 値はdocumentだけで決まり、変数・operationNameは考慮しない(validation cacheと同一の挙動)。
const complexityCache = new WeakMap<DocumentNode, number>();

// addValidationRuleはYogaのvalidation cacheで実行がスキップされうるので、hookで直接計算する
export const complexity: Plugin<PluginContext> = {
  onValidate({ params, setResult, extendContext, context }) {
    const { schema, documentAST } = params;
    const { variables, operationName } = context.params;

    let requestedQueryCost = complexityCache.get(documentAST);
    if (requestedQueryCost == null) {
      requestedQueryCost = getComplexity({
        estimators: complexityEstimators,
        schema,
        query: documentAST,
        ...(variables && {
          variables,
        }),
        ...(operationName && {
          operationName,
        }),
        maxQueryNodes: 10_000,
      });
      complexityCache.set(documentAST, requestedQueryCost);
    }

    extendContext({ queryComplexity: requestedQueryCost });

    if (requestedQueryCost > maxComplexity) {
      setResult([queryTooComplexError(maxComplexity, requestedQueryCost)]);
    }
  },
};
