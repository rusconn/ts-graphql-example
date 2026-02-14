import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_schema.ts";

export const tokenExpiredErr = (cause?: unknown) =>
  new GraphQLError("The access token has expired, please refresh the token.", {
    extensions: { code: ErrorCode.TokenExpired },
    ...(cause != null && {
      originalError: Error.isError(cause) ? cause : new Error("non-error value", { cause }),
    }),
  });
