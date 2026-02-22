import { GraphQLError } from "graphql";

import { toError } from "../../../../../util/error.ts";
import { ErrorCode } from "../../_types.ts";

export const internalServerError = (cause?: unknown) =>
  new GraphQLError("Internal Server Error", {
    extensions: { code: ErrorCode.InternalServerError },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
