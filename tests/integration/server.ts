import type { DocumentNode } from "graphql";

import { defaultContext } from "it/context";
import { DBData } from "it/data";
import type { Context } from "@/server/types";
import { makeServer } from "@/server/utils";

/**
 * テスト用のサーバインスタンス
 *
 * Node.js のモジュールキャッシュにより全テストケースで使いまわされる。
 *
 * 注意: サーバのインメモリキャッシュを使う場合はキャッシュを共有することになる。
 * 他のテストケースで発生したキャッシュの影響を受けたくない場合は別途サーバインスタンスを作成すること。
 */
export const server = makeServer();

type ExecuteOperationParams<TVariables> = {
  variables?: TVariables;
  user?: Context["user"];
};

export const executeSingleResultOperation =
  (query: DocumentNode) =>
  async <TData, TVariables>({
    variables,
    user = DBData.admin,
  }: ExecuteOperationParams<TVariables>) => {
    const res = await server.executeOperation<TData, TVariables>(
      { query, variables },
      { contextValue: { ...defaultContext, user } }
    );

    if (res.body.kind !== "single") {
      throw new Error("not single");
    }

    return res.body.singleResult;
  };
