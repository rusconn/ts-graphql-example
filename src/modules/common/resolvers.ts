import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";

export const forbiddenErr = (originalError?: Error) =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
    originalError,
  });

export const badUserInputErr = (message: string, originalError?: Error) =>
  new GraphQLError(message, {
    extensions: { code: ErrorCode.BadUserInput },
    originalError,
  });
