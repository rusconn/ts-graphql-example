import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import * as RefreshTokenCookie from "../../../_shared/auth/refresh-token-cookie.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import type { Context } from "../../yoga/context.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type MutationSignupArgs } from "../_types.ts";
import { resolver } from "./signup.ts";

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

const signup = async (
  ctx: ContextForIT, //
  args: MutationSignupArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationSignupArgs = {
    name: "foo",
    email: "bar",
    password: "baz",
  };

  it("not rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    try {
      await signup(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });

  it("rejects when user is authenticated", async () => {
    const ctx = context.alice();

    const before = await queries.user.count();

    await expect(signup(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );

    const after = await queries.user.count();
    expect(after).toBe(before);
  });
});

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.guest();
    const args: MutationSignupArgs = {
      name: "a".repeat(Domain.User.Name.MAX + 1),
      email: "email@example.com",
      password: "password",
    };

    const before = await queries.user.count();

    const result = await signup(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["name"]);

    const after = await queries.user.count();
    expect(after).toBe(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.guest();
    const args: MutationSignupArgs = {
      name: "name",
      email: "email@example.com",
      password: "password",
    };

    const result = await signup(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("not signups when email is already taken", async () => {
    const ctx = context.guest();
    const args: MutationSignupArgs = {
      name: "name",
      email: dto.users.alice.email,
      password: "password",
    };

    const result = await signup(ctx, args);
    assert(result?.__typename === "EmailAlreadyTakenError", result?.__typename);

    // DBの一意制約違反発生時にトランザクションがabortされるのでafterの取得ができない。
  });

  it("signups using args", async () => {
    const ctx = context.guest();
    const args: MutationSignupArgs = {
      name: "name",
      email: "email@example.com",
      password: "password",
    };

    const before = await Promise.all([
      queries.user.count(), //
      RefreshTokenCookie.get(ctx as Context),
    ]);
    expect(before[0]).toBe(1);
    expect(before[1]).toBeUndefined();

    const result = await signup(ctx, args);
    assert(result?.__typename === "SignupSuccess", result?.__typename);
    const _token = result.token; // // 使えることはE2Eで検証する

    const after = await Promise.all([
      queries.user.count(), //
      RefreshTokenCookie.get(ctx as Context),
    ]);
    expect(after[0]).toBe(2);
    expect(after[1]).not.toBeUndefined();
  });
});
