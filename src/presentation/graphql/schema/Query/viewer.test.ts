import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { dto } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode } from "../_types.ts";
import { resolver } from "./viewer.ts";

let trx: ControlledTransaction<DB>;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
});

afterAll(async () => {
  await trx.rollback().execute();
});

const viewer = async (
  ctx: ContextForIT, //
) => {
  return await resolver({}, {}, createContext(ctx, trx));
};

describe("authorization", () => {
  it("not rejects when user is guest", async () => {
    const ctx = context.guest();

    try {
      await viewer(ctx);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await viewer(ctx);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

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
