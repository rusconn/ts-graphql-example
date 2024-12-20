import { GraphQLError } from "graphql";

import { ErrorCode } from "../../schema.ts";

export const forbiddenErr = (originalError?: Error) =>
  new GraphQLError("Forbidden", {
    extensions: { code: ErrorCode.Forbidden },
    originalError,
  });

export const badUserInputErr = (message: string, originalError?: Error) =>
  new GraphQLError(message, {
    extensions: { code: ErrorCode.BadUserInput },
    originalError,
  });

export const notFoundErr = (originalError?: Error) =>
  new GraphQLError("Not found", {
    extensions: { code: ErrorCode.NotFound },
    originalError,
  });

export const dateByUuid = (id: string) => {
  return new Date(decodeTime(id));
};

const decodeTime = (id: string) => {
  const time = id.replace("-", "").slice(0, 12);
  return Number.parseInt(time, 16);
};
