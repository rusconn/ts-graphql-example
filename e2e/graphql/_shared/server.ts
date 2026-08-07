import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
import type { ExecutionResult } from "graphql";

import { endpoint } from "../../../src/config/url.ts";
import * as RefreshTokenCookie from "../../../src/presentation/_shared/auth/refresh-token-cookie.ts";
import { yoga } from "../../../src/presentation/graphql/yoga.ts";

type ExecuteOperationParams<TVariables> = {
  token?: string;
  refreshToken?: string;
  variables?: TVariables;
};

export function executeSingleResultOperation<
  TData extends Record<string, any>,
  TVariables extends Record<string, any>,
>(document: DocumentTypeDecoration<TData, TVariables>) {
  return async ({ token, refreshToken, variables }: ExecuteOperationParams<TVariables>) => {
    const response = await yoga.fetch(endpoint, {
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
        query: document.toString(),
        ...(variables != null && {
          variables,
        }),
      }),
    });

    const result = (await response.json()) as ExecutionResult<TData>;

    return {
      status: response.status,
      headers: response.headers,
      ...result,
    };
  };
}

export function getRefreshTokenCookieValue(headers: Headers) {
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
}
