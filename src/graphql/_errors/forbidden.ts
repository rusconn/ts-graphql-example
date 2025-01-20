import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";

export const forbiddenErr = (originalError?: Error) =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
    originalError,
  });
