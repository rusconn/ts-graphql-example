import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto, graph } from "../_test/data.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type QueryUserArgs } from "../_types.ts";
import { resolver } from "./user.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice, domain.users.admin);
});

afterAll(async () => {
  await trx.rollback().execute();
});

const user = async (
  ctx: ContextForIT, //
  args: QueryUserArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: QueryUserArgs = {
    id: graph.todos.alice1.id,
  };

  it("rejects when user is not admin", async () => {
    const ctx = context.alice();

    await expect(user(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is admin", async () => {
    const ctx = context.admin();

    try {
      await user(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = context.admin();
    const args: QueryUserArgs = {
      id: "bad-id",
    };

    await expect(user(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = context.admin();
    const args: QueryUserArgs = {
      id: dummyId.user(),
    };

    try {
      await user(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("logic", () => {
  it("returns null when id not exists on graph", async () => {
    const ctx = context.admin();
    const args: QueryUserArgs = {
      id: dummyId.user(),
    };

    const result = await user(ctx, args);
    expect(result).toBeNull();
  });

  it("returns user when client does not own user", async () => {
    const ctx = context.admin();
    const args: QueryUserArgs = {
      id: graph.users.admin.id,
    };

    const result = await user(ctx, args);
    expect(result?.id).toBe(dto.users.admin.id);
  });

  it("returns user when client owns the user", async () => {
    const ctx = context.admin();
    const args: QueryUserArgs = {
      id: graph.users.alice.id,
    };

    const result = await user(ctx, args);
    expect(result?.id).toBe(dto.users.alice.id);
  });
});
