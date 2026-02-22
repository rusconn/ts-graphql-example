import { GraphQLError } from "graphql";

import { toError } from "../../../../../util/error.ts";
import { ErrorCode } from "../../_types.ts";

export const forbiddenError = (cause?: unknown) =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
