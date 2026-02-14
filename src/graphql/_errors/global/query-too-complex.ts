import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_schema.ts";

export const queryTooComplexErr = (max: number, actual: number) =>
  new GraphQLError(`The query is too complex: ${actual}. Maximum allowed complexity: ${max}`, {
    extensions: { code: ErrorCode.QueryTooComplex },
  });
