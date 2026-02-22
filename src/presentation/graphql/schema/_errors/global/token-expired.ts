import { GraphQLError } from "graphql";

import { toError } from "../../../../../util/error.ts";
import { ErrorCode } from "../../_types.ts";

export const tokenExpiredError = (cause?: unknown) =>
  new GraphQLError("The access token has expired, please refresh the token.", {
    extensions: { code: ErrorCode.AccessTokenExpired },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
