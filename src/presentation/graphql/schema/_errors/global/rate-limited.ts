import { GraphQLError } from "graphql";

import type { CostExtensions } from "../../../yoga/plugins/rate-limit/helpers.ts";
import { ErrorCode } from "../../_types.ts";

export function rateLimitedError(cost: CostExtensions) {
  return new GraphQLError("Too many requests", {
    extensions: {
      code: ErrorCode.RateLimited,
      http: { status: 429 },
      cost,
    },
  });
}
