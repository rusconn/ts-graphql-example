import { omit } from "es-toolkit";
import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../infra/datasources/_shared/generated.ts";
import { kysely } from "../../infra/datasources/db/client.ts";
import { ErrorCode, type MutationUserEmailChangeArgs } from "../_schema.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto } from "../_test/data.ts";
import {
  createContext,
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../_test/helpers.ts";
import { resolver } from "./userEmailChange.ts";

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

const userEmailChange = async (
  ctx: ContextForIT, //
  args: MutationUserEmailChangeArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationUserEmailChangeArgs = {
    email: "a",
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    const before = await queries.user.findOrThrow(dto.users.alice.id);

    await expect(userEmailChange(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );

    const after = await queries.user.findOrThrow(dto.users.alice.id);
    expect(after).toStrictEqual(before);
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await userEmailChange(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationUserEmailChangeArgs = {
      email: "emailexample.com",
    };

    const before = await queries.user.findOrThrow(ctx.user.id);

    const result = await userEmailChange(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["email"]);

    const after = await queries.user.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationUserEmailChangeArgs = {
      email: "email@example.com",
    };

    const result = await userEmailChange(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("logic", () => {
  it("returns an error when email already taken", async () => {
    await seeders.users(domain.users.admin);

    const ctx = context.alice();
    const args: MutationUserEmailChangeArgs = {
      email: dto.users.admin.email,
    };

    const result = await userEmailChange(ctx, args);
    expect(result?.__typename).toBe("EmailAlreadyTakenError");

    // DBの一意制約違反発生時にトランザクションがabortされるのでafterの取得ができない。
  });

  it("changes email using args", async () => {
    const ctx = context.alice();
    const args: MutationUserEmailChangeArgs = {
      email: "email@example.com",
    };

    const before = await queries.user.findOrThrow(ctx.user.id);

    const result = await userEmailChange(ctx, args);
    assert(result?.__typename === "UserEmailChangeSuccess", result?.__typename);
    const changed = result.user;
    expect(omit(changed, ["email", "updatedAt"])).toStrictEqual(
      omit(before, ["email", "updatedAt"]),
    );
    expect(changed.email).toBe("email@example.com");
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.user.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(changed);
  });
});
