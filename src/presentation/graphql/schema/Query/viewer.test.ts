import type { ControlledTransaction } from "kysely";

import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import type { DB } from "../../../../infrastructure/datasources/db/types.ts";
import { dto } from "../_test/data.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { createContext } from "../_test/helpers.ts";
import { resolver } from "./viewer.ts";

let trx: ControlledTransaction<DB>;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
});

afterAll(async () => {
  await trx.rollback().execute();
});

async function viewer(
  ctx: ContextForIT, //
) {
  return await resolver({}, {}, createContext(ctx, trx));
}

describe("logic", () => {
  it("returns null when client is a guest", async () => {
    const ctx = context.guest();

    const result = await viewer(ctx);
    expect(result).toBeNull();
  });

  it("returns context user when client is authenticated", async () => {
    const ctx = context.alice();

    const result = await viewer(ctx);
    expect(result?.id).toBe(dto.users.alice.id);
  });
});
