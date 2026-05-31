import { GraphQLError } from "graphql";

import { toError } from "../../../../../util/error.ts";
import { ErrorCode } from "../../_types.ts";

export function tokenExpiredError(cause?: unknown) {
  return new GraphQLError("The access token has expired, please refresh the token.", {
    extensions: { code: ErrorCode.AccessTokenExpired },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
}
