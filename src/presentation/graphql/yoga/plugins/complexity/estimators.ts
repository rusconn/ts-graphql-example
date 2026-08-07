import { directiveEstimator, simpleEstimator } from "graphql-query-complexity";
import type { ComplexityEstimator, ComplexityEstimatorArgs } from "graphql-query-complexity";

const introspectionFieldEstimator = ({ field }: ComplexityEstimatorArgs) => {
  return field.name.startsWith("__") ? 0 : undefined;
};

export const complexityEstimators: ComplexityEstimator[] = [
  introspectionFieldEstimator,
  directiveEstimator(),
  simpleEstimator({ defaultComplexity: 1 }),
];
