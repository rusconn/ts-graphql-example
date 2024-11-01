import { GraphQLError } from "graphql";
import { decodeTime, type ulid } from "ulid";

import { ErrorCode } from "../../schema.ts";

export type { Context } from "../../context.ts";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export const dateByUlid = (id: ReturnType<typeof ulid>) => {
  return new Date(decodeTime(id));
};
