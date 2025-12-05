import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";

import { yoga } from "../src/yoga.ts";

import type { Data } from "./data.ts";

type ExecuteOperationParams<TVariables> = {
  token?: typeof Data.token.admin;
  refreshToken?: typeof Data.refreshToken.admin;
  variables?: TVariables;
};

export const executeSingleResultOperation =
  <TData, TVariables extends object>(query: string) =>
  async ({ token, refreshToken, variables }: ExecuteOperationParams<TVariables>) => {
    const result = await executor<TData, TVariables>({
      document: parse(query),
      ...(variables != null && { variables }),
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

    assertSingleResult(result);

    return result;
  };

const executor = buildHTTPExecutor({
  fetch: yoga.fetch,
});

function assertSingleResult<TResult extends object>(
  result: TResult | AsyncIterable<TResult>,
): asserts result is TResult {
  if (Symbol.asyncIterator in result) {
    throw new Error("Expected single result");
  }
}
