import { omit } from "es-toolkit";
import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import * as Domain from "../../../../domain/entities.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import {
  createQueries,
  createSeeders,
  type Queries,
  type Seeders,
} from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type MutationLoginPasswordChangeArgs } from "../_types.ts";
import { resolver } from "./loginPasswordChange.ts";

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

const loginPasswordChange = async (
  ctx: ContextForIT, //
  args: MutationLoginPasswordChangeArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationLoginPasswordChangeArgs = {
    oldPassword: "a",
    newPassword: "b",
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    await expect(loginPasswordChange(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await loginPasswordChange(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationLoginPasswordChangeArgs = {
      oldPassword: "a".repeat(Domain.User.Password.MIN - 1),
      newPassword: "password2",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);

    const result = await loginPasswordChange(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["oldPassword"]);

    const after = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationLoginPasswordChangeArgs = {
      oldPassword: "password",
      newPassword: "password2",
    };

    const result = await loginPasswordChange(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("returns an error when passwords are the same", async () => {
    const ctx = context.alice();
    const args: MutationLoginPasswordChangeArgs = {
      oldPassword: "password",
      newPassword: "password",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);

    const result = await loginPasswordChange(ctx, args);
    expect(result?.__typename).toBe("SamePasswordsError");

    const after = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("returns an error when oldPassword is incorrect", async () => {
    const ctx = context.alice();
    const args: MutationLoginPasswordChangeArgs = {
      oldPassword: "incorrect",
      newPassword: "password",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);

    const result = await loginPasswordChange(ctx, args);
    expect(result?.__typename).toBe("IncorrectOldPasswordError");

    const after = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);
    expect(after).toStrictEqual(before);
  });

  it("changes password using args", async () => {
    const ctx = context.alice();
    const args: MutationLoginPasswordChangeArgs = {
      oldPassword: "alicealice",
      newPassword: "alicealice2",
    };

    const before = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);

    const result = await loginPasswordChange(ctx, args);
    assert(result?.__typename === "LoginPasswordChangeSuccess", result?.__typename);
    const changed = result.user;
    expect(omit(changed, ["updatedAt"])).toStrictEqual(omit(before[1], ["updatedAt"]));
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before[1].updatedAt.getTime());

    const after = await Promise.all([
      queries.credential.findOrThrow(dto.users.alice.id),
      queries.user.findOrThrow(dto.users.alice.id),
    ]);
    expect(after[0].password).not.toBe(before[0].password);
    expect(after[1]).toStrictEqual(changed);
  });
});
