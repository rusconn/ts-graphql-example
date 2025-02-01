import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";

import { yoga } from "../src/server.ts";

import type { Data } from "./data.ts";

type ExecuteOperationParams<TVariables> = {
  variables?: TVariables;
  user: (typeof Data.context)[keyof typeof Data.context];
};

export const executeSingleResultOperation =
  <TData, TVariables extends object>(query: string) =>
  async ({ variables, user }: ExecuteOperationParams<TVariables>) => {
    const result = await executor<TData, TVariables>({
      document: parse(query),
      variables,
      extensions: {
        headers: {
          ...(user?.token && {
            authorization: `Bearer ${user.token}`,
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
