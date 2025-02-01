import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";

import { pickDefined } from "../src/lib/object/pickDefined.ts";
import { yoga } from "../src/server.ts";

import type { Data } from "./data.ts";

type ExecuteOperationParams<TVariables> = {
  token?: typeof Data.token.admin;
  variables?: TVariables;
};

export const executeSingleResultOperation =
  <TData, TVariables extends object>(query: string) =>
  async ({ variables, token }: ExecuteOperationParams<TVariables>) => {
    const result = await executor<TData, TVariables>(
      pickDefined({
        document: parse(query),
        variables,
        extensions: {
          headers: {
            ...(token != null && {
              authorization: `Bearer ${token}`,
            }),
          },
        },
      }),
    );

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
