import { GraphQLError } from "graphql";

import { ErrorCode } from "../../_types.ts";

export function authenticationError() {
  return new GraphQLError("Authentication error", {
    extensions: { code: ErrorCode.AuthenticationError },
  });
}
