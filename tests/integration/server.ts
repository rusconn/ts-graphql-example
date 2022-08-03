import { prisma } from "it/prisma";
import { getEnvsWithValidation, makeServer } from "@/utils";

const envs = getEnvsWithValidation();

/**
 * テスト用のサーバインスタンス
 *
 * Node.js のモジュールキャッシュにより全テストケースで使いまわされる。
 *
 * 注意: サーバのインメモリキャッシュを使う場合はキャッシュを共有することになる。
 * 他のテストケースで発生したキャッシュの影響を受けたくない場合は別途サーバインスタンスを作成すること。
 */
export const server = makeServer({ ...envs, prisma });
