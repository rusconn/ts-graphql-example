import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { parse } from "graphql";

import { endpoint } from "../../../src/config/url.ts";
import * as RefreshTokenCookie from "../../../src/presentation/_shared/auth/refresh-token-cookie.ts";
import { yoga } from "../../../src/presentation/graphql/yoga.ts";

type ExecuteOperationParams<TVariables> = {
  token?: string;
  refreshToken?: string;
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
            cookie: `${RefreshTokenCookie.name}=${refreshToken}`,
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

type FetchGraphQLParam = {
  token?: string;
  refreshToken?: string;
  variables?: Record<string, unknown>;
};

// レスポンスヘッダーにアクセスするために使う
export const fetchGraphQL = (query: string) => async (param: FetchGraphQLParam) => {
  const { token, refreshToken, variables } = param;

  return await yoga.fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token != null && {
        authorization: `Bearer ${token}`,
      }),
      ...(refreshToken != null && {
        cookie: `${RefreshTokenCookie.name}=${refreshToken}`,
      }),
    },
    body: JSON.stringify({
      query,
      ...(variables != null && {
        variables,
      }),
    }),
  });
};

export const getRefreshTokenCookieValue = (headers: Headers) => {
  const setCookie = headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith(`${RefreshTokenCookie.name}=`));
  if (setCookie == null) {
    throw new Error(`${RefreshTokenCookie.name} not found in the response`);
  }
  const cookieValue = setCookie.split("; ")[0]?.split("=")[1];
  if (cookieValue == null) {
    throw new Error(`${RefreshTokenCookie.name} value not found in the response`);
  }
  return cookieValue;
};
