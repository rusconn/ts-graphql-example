import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_types.ts";

export const badUserInputError = (message: string, cause?: unknown) =>
  new GraphQLError(message, {
    extensions: { code: ErrorCode.BadUserInput },
    ...(cause != null && {
      originalError: Error.isError(cause) ? cause : new Error("non-error value", { cause }),
    }),
  });
