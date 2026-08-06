import { GraphQLError } from "graphql";

import { toError } from "../../../../../lib/error.ts";
import { ErrorCode } from "../../_types.ts";

export function internalServerError(cause?: unknown) {
  return new GraphQLError("Internal Server Error", {
    extensions: { code: ErrorCode.InternalServerError },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
}
