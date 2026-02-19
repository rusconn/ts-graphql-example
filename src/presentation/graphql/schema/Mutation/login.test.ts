import type { ControlledTransaction } from "kysely";

import * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import type { NewRefreshToken } from "../../../../infrastructure/datasources/_shared/types.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { addDates } from "../../../../lib/date-immutable.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import type { Context } from "../../yoga/context.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { db, domain } from "../_test/data.ts";
import {
  createContext,
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../_test/helpers.ts";
import type { MutationLoginArgs } from "../_types.ts";
import { resolver } from "./login.ts";

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

const login = async (
  ctx: ContextForIT, //
  args: MutationLoginArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: `${"a".repeat(Domain.User.Email.MAX - 12 + 1)}@example.com`,
      password: "password",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: "email@example.com",
      password: "password",
    };

    const result = await login(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("returns an error when email does not exists on server", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: "not-exists@example.com",
      password: "password",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginFailedError", result?.__typename);
    expect(result.message).toBe("Incorrect email or password."); // should mask detail

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("returns an error when args is incorrect", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "incorrect",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginFailedError", result?.__typename);
    expect(result.message).toBe("Incorrect email or password."); // should mask detail

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("logins and supplies a refresh token", async () => {
    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "alicealice",
    };

    const before = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(before[0]).toBeUndefined();
    expect(before[1].length).toBe(0);

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginSuccess", result?.__typename);
    const _token = result.token; // 使えることはE2Eで検証する

    const after = await Promise.all([
      RefreshTokenCookie.get(ctx as Context),
      queries.refreshToken.findTheirs(ctx.user.id),
    ]);
    expect(after[0]).not.toBeUndefined();
    expect(after[1].length).toBe(1);
  });

  it("retains latest 5 refresh tokens", async () => {
    // seed
    const dbRefreshTokens = Array.from({ length: 5 }).map((_, i) => {
      const createdAt = new Date(`2026-01-01T00:00:00.00${i}Z`);
      const expiresAt = addDates(createdAt, 7);
      return {
        token: `$2b$04$UJnbSNtlTFcLZkRtPqx2SOswuES4NFkKjP1rV9pb.SP037OP0ru/${i}`,
        userId: db.users.alice.id,
        expiresAt,
        createdAt,
      } satisfies NewRefreshToken;
    });
    const refreshTokens = dbRefreshTokens.map(Domain.RefreshToken.parseOrThrow);
    await seeders.refreshTokens(...refreshTokens);

    const ctx = context.alice();
    const args: MutationLoginArgs = {
      email: ctx.user.email,
      password: "alicealice",
    };

    const before = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(before.length).toBe(5);
    expect(before.map((a) => a.createdAt.toISOString()).sort()[0]).toEqual(
      `2026-01-01T00:00:00.00${0}Z`,
    );

    const result = await login(ctx, args);
    assert(result?.__typename === "LoginSuccess", result?.__typename);
    const _token = result.token; // 使えることはE2Eで検証する

    const after = await queries.refreshToken.findTheirs(ctx.user.id);
    expect(after.length).toBe(5);
    expect(after.map((a) => a.createdAt.toISOString()).sort()[0]).toEqual(
      `2026-01-01T00:00:00.00${1}Z`,
    );
  });
});
