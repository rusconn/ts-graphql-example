import { GraphQLError } from "graphql";

import { toError } from "../../../../../util/error.ts";
import { ErrorCode } from "../../_types.ts";

export const badUserInputError = (message: string, cause?: unknown) =>
  new GraphQLError(message, {
    extensions: { code: ErrorCode.BadUserInput },
    ...(cause != null && {
      originalError: toError(cause),
    }),
  });
