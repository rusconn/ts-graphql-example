import type { DocumentNode } from "graphql";

import { defaultContext } from "it/context";
import { admin } from "it/data";
import type { Context } from "@/types";
import { parseEnvVars, makeServer } from "@/utils";

const envs = parseEnvVars(process.env);

/**
 * テスト用のサーバインスタンス
 *
 * Node.js のモジュールキャッシュにより全テストケースで使いまわされる。
 *
 * 注意: サーバのインメモリキャッシュを使う場合はキャッシュを共有することになる。
 * 他のテストケースで発生したキャッシュの影響を受けたくない場合は別途サーバインスタンスを作成すること。
 */
export const server = makeServer(envs);

type ExecuteOperationParams<TVariables> = {
  variables?: TVariables;
  user?: Context["user"];
};

export const executeSingleResultOperation =
  (query: DocumentNode) =>
  async <TData, TVariables>({ variables, user }: ExecuteOperationParams<TVariables>) => {
    const res = await server.executeOperation<TData, TVariables>(
      { query, variables },
      { contextValue: { ...defaultContext, user: user ?? admin } }
    );

    if (res.body.kind !== "single") {
      throw new Error("not single");
    }

    return res.body.singleResult;
  };
