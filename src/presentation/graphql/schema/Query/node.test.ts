import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto, graph } from "../_test/data.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type QueryNodeArgs } from "../_types.ts";
import { resolver } from "./node.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice, domain.users.admin);
  await seeders.todos(domain.todos.alice1, domain.todos.admin1);
});

afterAll(async () => {
  await trx.rollback().execute();
});

const node = async (
  ctx: ContextForIT, //
  args: QueryNodeArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: QueryNodeArgs = {
    id: graph.todos.alice1.id,
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    await expect(node(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await node(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = context.alice();
    const args: QueryNodeArgs = {
      id: "bad-id",
    };

    await expect(node(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = context.alice();
    const args: QueryNodeArgs = {
      id: dummyId.todo(),
    };

    try {
      await node(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("logic", () => {
  it("returns null when id not exists on graph", async () => {
    const ctx = context.alice();
    const args: QueryNodeArgs = {
      id: dummyId.todo(),
    };

    const result = await node(ctx, args);
    expect(result).toBeNull();
  });

  it("returns null when client does not own node", async () => {
    const args: QueryNodeArgs = {
      id: graph.todos.admin1.id,
    };

    const result1 = await node(context.alice(), args);
    expect(result1).toBeNull();

    const result2 = await node(context.admin(), args);
    expect(result2).not.toBeNull();
  });

  it("returns node when client owns the node", async () => {
    const ctx = context.alice();
    const args: QueryNodeArgs = {
      id: graph.todos.alice1.id,
    };

    const result = await node(ctx, args);
    assert(result);
    expect(result.id).toBe(dto.todos.alice1.id);
  });
});
