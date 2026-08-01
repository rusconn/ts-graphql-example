import {
  createComplexityRule,
  directiveEstimator,
  simpleEstimator,
} from "graphql-query-complexity";
import type { ComplexityEstimatorArgs } from "graphql-query-complexity";
import type { Plugin } from "graphql-yoga";

import { maxComplexity } from "../../../../config/graphql-security.ts";
import { queryTooComplexError } from "../../schema/_errors/global/query-too-complex.ts";

export const complexity: Plugin = {
  onValidate({ context, addValidationRule }) {
    const { variables, operationName } = context.params;

    const rule = createComplexityRule({
      maximumComplexity: maxComplexity,
      ...(variables && {
        variables,
      }),
      ...(operationName && {
        operationName,
      }),
      createError: queryTooComplexError,
      maxQueryNodes: 10_000,
      estimators: [
        introspectionFieldEstimator,
        directiveEstimator(),
        simpleEstimator({ defaultComplexity: 1 }),
      ],
      context,
    });

    addValidationRule(rule);
  },
};

const introspectionFieldEstimator = ({ field }: ComplexityEstimatorArgs) => {
  return field.name.startsWith("__") ? 0 : undefined;
};
