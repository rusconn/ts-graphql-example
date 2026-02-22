import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type ResolversParentTypes } from "../_types.ts";
import { resolver } from "./user.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice);
  await seeders.todos(domain.todos.alice1);
});

afterAll(async () => {
  await trx.rollback().execute();
});

const user = async (
  ctx: ContextForIT, //
  parent: ResolversParentTypes["Todo"],
) => {
  return await resolver(parent, {}, createContext(ctx, trx));
};

describe("authorization", () => {
  const parent: ResolversParentTypes["Todo"] = dto.todos.alice1;

  it("rejects when user is not owner", async () => {
    const ctx = context.guest();

    await expect(user(ctx, parent)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is admin", async () => {
    const ctx = context.admin();

    try {
      await user(ctx, parent);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });

  it("not rejects when user is owner", async () => {
    const ctx = context.alice();

    try {
      await user(ctx, parent);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("logic", () => {
  it("returns user when client is owner", async () => {
    const ctx = context.alice();
    const parent: ResolversParentTypes["Todo"] = dto.todos.alice1;

    const result = await user(ctx, parent);
    expect(result?.id).toBe(dto.users.alice.id);
  });
});
