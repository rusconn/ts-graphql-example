import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_types.ts";

export const authenticationError = () =>
  new GraphQLError("Authentication error", {
    extensions: { code: ErrorCode.AuthenticationError },
  });
