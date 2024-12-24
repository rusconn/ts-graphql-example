import { GraphQLError } from "graphql";

import { ErrorCode } from "../../../schema.ts";

export const internalServerError = (originalError?: Error) =>
  new GraphQLError("Internal Server Error", {
    extensions: { code: ErrorCode.InternalServerError },
    originalError,
  });
