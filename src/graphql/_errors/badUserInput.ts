import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";

export const badUserInputErr = (message: string, originalError?: Error) =>
  new GraphQLError(message, {
    extensions: { code: ErrorCode.BadUserInput },
    originalError,
  });
