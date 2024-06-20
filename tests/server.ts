import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";

import { yoga } from "@/server.ts";

import { Data } from "tests/data.ts";

type ExecuteOperationParams<TVariables> = {
  variables?: TVariables;
  user?: (typeof Data.context)[keyof typeof Data.context];
};

/** デフォルトユーザーは admin */
export const executeSingleResultOperation =
  <TData, TVariables extends object>(query: string) =>
  async ({ variables, user = Data.context.admin }: ExecuteOperationParams<TVariables>) => {
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
