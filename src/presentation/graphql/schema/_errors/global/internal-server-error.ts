import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_types.ts";

export const internalServerError = (cause?: unknown) =>
  new GraphQLError("Internal Server Error", {
    extensions: { code: ErrorCode.InternalServerError },
    ...(cause != null && {
      originalError: Error.isError(cause) ? cause : new Error("non-error value", { cause }),
    }),
  });
