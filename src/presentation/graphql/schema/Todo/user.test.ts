import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { domain, dto } from "../_test/data.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { createContext } from "../_test/helpers.ts";
import type { ResolversParentTypes } from "../_types.ts";
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

async function user(
  ctx: ContextForIT, //
  parent: ResolversParentTypes["Todo"],
) {
  return await resolver(parent, {}, createContext(ctx, trx));
}

describe("logic", () => {
  it("returns user when client is owner", async () => {
    const ctx = context.alice();
    const parent: ResolversParentTypes["Todo"] = dto.todos.alice1;

    const result = await user(ctx, parent);
    expect(result?.id).toBe(dto.users.alice.id);
  });
});
