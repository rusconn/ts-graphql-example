import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";

import { yoga } from "../src/yoga.ts";

import type { refreshTokens, tokens } from "./data.ts";

type ExecuteOperationParams<TVariables> = {
  token?: typeof tokens.admin;
  refreshToken?: typeof refreshTokens.admin;
  variables?: TVariables;
};

export const executeSingleResultOperation = <TData, TVariables extends object>(query: string) => {
  return async ({ token, refreshToken, variables }: ExecuteOperationParams<TVariables>) => {
    const result = await executor<TData, TVariables>({
      document: parse(query),
      ...(variables != null && {
        variables,
      }),
      extensions: {
        headers: {
          ...(token != null && {
            authorization: `Bearer ${token}`,
          }),
          ...(refreshToken != null && {
            cookie: `refresh_token=${refreshToken}`,
          }),
        },
      },
    });

    if (!isSingleResult(result)) {
      throw new Error("Expected single result");
    }

    return result;
  };
};

const executor = buildHTTPExecutor({
  fetch: yoga.fetch,
});

const isSingleResult = <TResult extends object>(
  result: TResult | AsyncIterable<TResult>,
): result is TResult => {
  return !(Symbol.asyncIterator in result);
};
