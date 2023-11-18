import { parse } from "graphql";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";

import { ContextData } from "tests/data.ts";
import type { ContextUser } from "@/modules/common/resolvers.ts";
import { yoga } from "@/server.ts";

type ExecuteOperationParams<TVariables> = {
  variables?: TVariables;
  user?: ContextUser;
};

/** デフォルトユーザーは admin */
export const executeSingleResultOperation =
  <TData, TVariables extends object>(query: string) =>
  async ({ variables, user = ContextData.admin }: ExecuteOperationParams<TVariables>) => {
    const result = await executor<TData, TVariables>({
      document: parse(query),
      variables,
      extensions:
        user.role !== "GUEST" && user.token != null
          ? { headers: { authorization: `Bearer ${user.token}` } }
          : {},
    });

    assertSingleResult(result);

    return result;
  };

const executor = buildHTTPExecutor({
  // linter に従うと正しく動かない
  // eslint-disable-next-line @typescript-eslint/unbound-method
  fetch: yoga.fetch,
});

function assertSingleResult<TResult extends object>(
  result: TResult | AsyncIterable<TResult>
): asserts result is TResult {
  if (Symbol.asyncIterator in result) {
    throw new Error("Expected single result");
  }
}
