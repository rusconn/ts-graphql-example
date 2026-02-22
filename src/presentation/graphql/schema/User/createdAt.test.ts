import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto, graph } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type ResolversParentTypes } from "../_types.ts";
import { resolver } from "./createdAt.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice);
});

afterAll(async () => {
  await trx.rollback().execute();
});

const createdAt = async (
  ctx: ContextForIT, //
  parent: ResolversParentTypes["User"],
) => {
  return await resolver(parent, {}, createContext(ctx, trx));
};

describe("authorization", () => {
  const parent: ResolversParentTypes["User"] = dto.users.alice;

  it("rejects when user is not owner", async () => {
    const ctx = context.guest();

    await expect(createdAt(ctx, parent)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is admin", async () => {
    const ctx = context.admin();

    try {
      await createdAt(ctx, parent);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });

  it("not rejects when user is owner", async () => {
    const ctx = context.alice();

    try {
      await createdAt(ctx, parent);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("logic", () => {
  it("returns parent createdAt", async () => {
    const ctx = context.alice();
    const parent: ResolversParentTypes["User"] = dto.users.alice;

    const result = await createdAt(ctx, parent);
    expect(result?.getTime()).toBe(Date.parse(graph.users.alice.createdAt));
  });
});
