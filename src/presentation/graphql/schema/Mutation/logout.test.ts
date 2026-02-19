import type { ControlledTransaction } from "kysely";

import type { RefreshToken } from "../../../../domain/entities.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import type { Context } from "../../yoga/context.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { client, db, domain, dto } from "../_test/data.ts";
import {
  createContext,
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../_test/helpers.ts";
import { resolver } from "./logout.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;
let queries: Queries;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  queries = createQueries(trx);
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

const logout = async (
  ctx: ContextForIT, //
) => {
  return await resolver({}, {}, createContext(ctx, trx));
};

describe("usecase", () => {
  it("logouts when the cookie is not exist", async () => {
    const ctx = context.alice();

    await logout(ctx);
  });

  it("logouts and clear the cookie when the cookie is invalid", async () => {
    const ctx = context.alice();
    await RefreshTokenCookie.set(ctx as Context, {
      value: "bad-refresh-token" as RefreshToken.Token.Type,
      expires: db.refreshTokens.alice.expiresAt,
    });

    const before = await ctx.request.cookieStore.get(RefreshTokenCookie.base.name);
    expect(before?.value).not.toBe("");
    expect(before?.expires).not.toBe(0);

    await logout(ctx);

    const after = await ctx.request.cookieStore.get(RefreshTokenCookie.base.name);
    expect(after?.value).toBe("");
    expect(after?.expires).toBe(0);
  });

  it("logouts and clear the cookie when the cookie is valid", async () => {
    await seeders.refreshTokens(domain.refreshTokens.alice);

    const ctx = context.alice();
    await RefreshTokenCookie.set(ctx as Context, {
      value: client.refreshTokens.alice,
      expires: db.refreshTokens.alice.expiresAt,
    });

    const before = await Promise.all([
      ctx.request.cookieStore.get(RefreshTokenCookie.base.name),
      queries.refreshToken.countTheirs(dto.users.alice.id),
    ]);
    expect(before[0]?.value).not.toBe("");
    expect(before[0]?.expires).not.toBe(0);
    expect(before[1]).toBe(1);

    await logout(ctx);

    const after = await Promise.all([
      ctx.request.cookieStore.get(RefreshTokenCookie.base.name),
      queries.refreshToken.countTheirs(dto.users.alice.id),
    ]);
    expect(after[0]?.value).toBe("");
    expect(after[0]?.expires).toBe(0);
    expect(after[1]).toBe(before[1] - 1);
  });
});
