import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";

export const notFoundErr = () =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
  });

export const dateByUuid = (id: string) => {
  return new Date(decodeTime(id));
};

const decodeTime = (id: string) => {
  const time = id.replace("-", "").slice(0, 12);
  return Number.parseInt(time, 16);
};
