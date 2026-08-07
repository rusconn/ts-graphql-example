import type { DocumentNode } from "graphql";
import { getComplexity } from "graphql-query-complexity";
import type { Plugin } from "graphql-yoga";

import { maxComplexity } from "../../../../config/graphql-security.ts";
import { queryTooComplexError } from "../../schema/_errors/global/query-too-complex.ts";
import type { PluginContext } from "../context.ts";
import { complexityEstimators, pluralContext } from "./complexity/estimators.ts";

// parse cacheが同じDocumentNodeインスタンスを再利用するため、計算結果をキャッシュできる。
// コストはvariablesとoperationNameに依存するため、それらもキーに含める。
// ※同一のDocumentNodeに複数オペレーションが含まれる場合がある。
const complexityCache = new WeakMap<DocumentNode, Map<string, number>>();

// addValidationRuleはYogaのvalidation cacheで実行がスキップされうるので、hookで直接計算する
export const complexity: Plugin<PluginContext> = {
  onValidate({ params, setResult, extendContext, context }) {
    const { schema, documentAST } = params;
    const { variables, operationName } = context.params;

    let cache = complexityCache.get(documentAST);
    if (cache == null) {
      cache = new Map();
      complexityCache.set(documentAST, cache);
    }

    const cacheKey = `${operationName ?? ""}|${JSON.stringify(variables ?? null)}`;
    let requestedQueryCost = cache.get(cacheKey);
    if (requestedQueryCost == null) {
      requestedQueryCost = getComplexity({
        estimators: complexityEstimators,
        schema,
        query: documentAST,
        context: {
          pluralContext: pluralContext(schema, documentAST, operationName, variables),
        },
        ...(variables && {
          variables,
        }),
        ...(operationName && {
          operationName,
        }),
        maxQueryNodes: 10_000,
      });
      cache.set(cacheKey, requestedQueryCost);
    }

    extendContext({ queryComplexity: requestedQueryCost });

    if (requestedQueryCost > maxComplexity) {
      setResult([queryTooComplexError(maxComplexity, requestedQueryCost)]);
    }
  },
};
