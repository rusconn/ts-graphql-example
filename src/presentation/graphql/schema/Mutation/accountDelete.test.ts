import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import { User } from "../../../../domain/entities.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { client, db, domain, dto, graph } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type MutationAccountDeleteArgs } from "../_types.ts";
import { resolver } from "./accountDelete.ts";

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

const accountDelete = async (
  ctx: ContextForIT, //
  args: MutationAccountDeleteArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationAccountDeleteArgs = {
    password: "dummy",
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    await expect(accountDelete(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await accountDelete(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationAccountDeleteArgs = {
      password: "a".repeat(User.Password.MIN - 1),
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(ctx.user.id),
      queries.user.findOrThrow(ctx.user.id),
    ]);

    const result = await accountDelete(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["password"]);

    const after = await Promise.all([
      queries.credential.findOrThrow(ctx.user.id),
      queries.user.findOrThrow(ctx.user.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationAccountDeleteArgs = {
      password: "alicealice",
    };

    const result = await accountDelete(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("deletes account and refresh-token cookie", async () => {
    await seeders.todos(domain.todos.alice1, domain.todos.alice2);
    await seeders.refreshTokens(domain.refreshTokens.alice);
    await seeders.users(domain.users.admin);

    const ctx = context.alice();
    await ctx.request.cookieStore.set({
      ...RefreshTokenCookie.base,
      value: client.refreshTokens.alice,
      expires: db.refreshTokens.alice.expiresAt,
    });
    const args: MutationAccountDeleteArgs = {
      password: "alicealice",
    };

    const before = await Promise.all([
      ctx.request.cookieStore.get(RefreshTokenCookie.name),
      queries.todo.countTheirs(dto.users.alice.id),
      queries.refreshToken.countTheirs(dto.users.alice.id),
      queries.user.count(),
    ]);
    expect(before[0]?.value).not.toBe("");
    expect(before[0]?.expires).not.toBe(0);
    expect(before[1]).toBe(2);
    expect(before[2]).toBe(1);
    expect(before[3]).toBe(2);

    const result = await accountDelete(ctx, args);
    assert(result?.__typename === "AccountDeleteSuccess", result?.__typename);
    expect(result.id).toBe(graph.users.alice.id);

    const after = await Promise.all([
      ctx.request.cookieStore.get(RefreshTokenCookie.name),
      queries.todo.countTheirs(dto.users.alice.id),
      queries.refreshToken.countTheirs(dto.users.alice.id),
      queries.user.count(),
    ]);
    expect(after[0]?.value).toBe("");
    expect(after[0]?.expires).toBe(0);
    expect(after[1]).toBe(0);
    expect(after[2]).toBe(0);
    expect(after[3]).toBe(1);
  });
});
