import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";

export const tokenExpiredErr = (originalError?: Error) =>
  new GraphQLError("The access token has expired, please refresh the token.", {
    extensions: { code: ErrorCode.TokenExpired },
    originalError,
  });
