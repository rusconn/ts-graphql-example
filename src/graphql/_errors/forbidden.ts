import { GraphQLError } from "graphql";

import { ErrorCode } from "../_schema.ts";

export const forbiddenErr = (cause?: unknown) =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
    ...(cause != null && {
      originalError: Error.isError(cause) ? cause : new Error("non-error value", { cause }),
    }),
  });
