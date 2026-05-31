import { GraphQLError } from "graphql";

import { toError } from "../../../../../util/error.ts";
import { ErrorCode } from "../../_types.ts";

export function forbiddenError(cause?: unknown) {
  return new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
}
