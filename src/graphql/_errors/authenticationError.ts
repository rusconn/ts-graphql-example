import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";

export const authenticationErr = () =>
  new GraphQLError("Authentication error", {
    extensions: { code: ErrorCode.AuthenticationError },
  });
