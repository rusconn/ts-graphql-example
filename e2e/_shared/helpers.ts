import type { Transaction } from "kysely";

import type { DB } from "../../src/infrastructure/datasources/_shared/types.ts";
import { kysely } from "../../src/infrastructure/datasources/db/client.ts";
import * as UTHelpers from "../../src/presentation/_shared/test/helpers/helpers.ts";

export async function clearTables() {
  await Promise.all([
    clearRefreshTokens(), //
    clearTodos(),
  ]);
  await clearUsers(); // CASCADE
}

export async function clearRefreshTokens() {
  await kysely.deleteFrom("refreshTokens").execute();
}
export async function clearTodos() {
  await kysely.deleteFrom("todos").execute();
}
export async function clearUsers() {
  await kysely.deleteFrom("users").execute(); // CASCADE
}

// 直列実行ならトランザックション扱いでいいでしょ多分…
const trx = kysely as Transaction<DB>;

export const seeders = UTHelpers.createSeeders(trx);
export const queries = UTHelpers.createQueries(trx);
