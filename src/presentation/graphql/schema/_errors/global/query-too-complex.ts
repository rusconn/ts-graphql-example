import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_types.ts";

export const queryTooComplexError = (max: number, actual: number) =>
  new GraphQLError(`The query is too complex: ${actual}. Maximum allowed complexity: ${max}`, {
    extensions: { code: ErrorCode.QueryTooComplex },
  });
