import { omit } from "es-toolkit";
import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type MutationAccountUpdateArgs } from "../_types.ts";
import { resolver } from "./accountUpdate.ts";

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

const accountUpdate = async (
  ctx: ContextForIT, //
  args: MutationAccountUpdateArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationAccountUpdateArgs = {};

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    await expect(accountUpdate(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await accountUpdate(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) {
        throw e;
      }
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationAccountUpdateArgs = { name: null };

    const before = await queries.user.findOrThrow(ctx.user.id);

    const result = await accountUpdate(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["name"]);

    const after = await queries.user.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationAccountUpdateArgs = {};

    const result = await accountUpdate(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("updates account using args", async () => {
    const ctx = context.alice();
    const args: MutationAccountUpdateArgs = {
      name: "foo",
    };

    const before = await queries.user.findOrThrow(ctx.user.id);

    const result = await accountUpdate(ctx, args);
    assert(result?.__typename === "AccountUpdateSuccess", result?.__typename);
    const updated = result.user;
    expect(omit(updated, ["name", "updatedAt"])).toStrictEqual(omit(before, ["name", "updatedAt"]));
    expect(updated.name).toBe("foo");
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.user.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(updated);
  });

  it("updates only updatedAt when args is empty", async () => {
    const ctx = context.alice();
    const args: MutationAccountUpdateArgs = {};

    const before = await queries.user.findOrThrow(ctx.user.id);

    const result = await accountUpdate(ctx, args);
    assert(result?.__typename === "AccountUpdateSuccess", result?.__typename);
    const updated = result.user;
    expect(omit(updated, ["updatedAt"])).toStrictEqual(omit(before, ["updatedAt"]));
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.user.findOrThrow(ctx.user.id);
    expect(after).toStrictEqual(updated);
  });
});
