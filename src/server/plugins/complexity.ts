import {
  createComplexityRule,
  directiveEstimator,
  simpleEstimator,
} from "graphql-query-complexity";
import type { Plugin } from "graphql-yoga";

import { maxComplexity } from "../../config/security.ts";
import type { PluginContext } from "../context.ts";
import { queryTooComplexErr } from "../../graphql/_errors/queryTooComplex.ts";

export const complexity: Plugin<PluginContext> = {
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
      createError: queryTooComplexErr,
      estimators: [directiveEstimator(), simpleEstimator()],
      context,
    });

    addValidationRule(rule);
  },
};
