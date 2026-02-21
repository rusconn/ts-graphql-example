import type { Transaction } from "kysely";

import type { DB } from "../../src/infrastructure/datasources/_shared/types.ts";
import { kysely } from "../../src/infrastructure/datasources/db/client.ts";
import * as UTHelpers from "../../src/presentation/graphql/schema/_test/helpers.ts";

export const dummyId = UTHelpers.dummyId;

export const clearTables = async () => {
  await Promise.all([
    clearRefreshTokens(), //
    clearTodos(),
  ]);
  await clearUsers(); // CASCADE
};

export const clearRefreshTokens = async () => {
  await kysely.deleteFrom("refreshTokens").execute();
};
export const clearTodos = async () => {
  await kysely.deleteFrom("todos").execute();
};
export const clearUsers = async () => {
  await kysely.deleteFrom("users").execute(); // CASCADE
};

// 直列実行ならトランザックション扱いでいいでしょ多分…
const trx = kysely as Transaction<DB>;

export const seeders = UTHelpers.createSeeders(trx);
export const queries = UTHelpers.createQueries(trx);
