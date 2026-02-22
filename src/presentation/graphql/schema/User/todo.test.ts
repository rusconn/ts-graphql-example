import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto, graph } from "../_test/data.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type ResolversParentTypes, type UserTodoArgs } from "../_types.ts";
import { resolver } from "./todo.ts";

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

const todo = async (
  ctx: ContextForIT, //
  parent: ResolversParentTypes["User"],
  args: UserTodoArgs,
) => {
  return await resolver(parent, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const parent: ResolversParentTypes["User"] = dto.users.alice;
  const args: UserTodoArgs = {
    id: dummyId.todo(),
  };

  it("rejects when user is not owner", async () => {
    const ctx = context.guest();

    await expect(todo(ctx, parent, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is admin", async () => {
    const ctx = context.admin();

    try {
      await todo(ctx, parent, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });

  it("not rejects when user is owner", async () => {
    const ctx = context.alice();

    try {
      await todo(ctx, parent, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  const ctx = context.alice();
  const parent: ResolversParentTypes["User"] = dto.users.alice;

  it("throws an input error when id is invalid", async () => {
    const args: UserTodoArgs = {
      id: "bad-id",
    };

    await expect(todo(ctx, parent, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const args: UserTodoArgs = {
      id: dummyId.todo(),
    };

    try {
      await todo(ctx, parent, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("logic", () => {
  it("returns null when id is not exists on server", async () => {
    const ctx = context.alice();
    const parent: ResolversParentTypes["User"] = dto.users.alice;
    const args: UserTodoArgs = {
      id: dummyId.todo(),
    };

    const result = await todo(ctx, parent, args);
    expect(result).toBeNull();
  });

  it("returns todo when user is owner", async () => {
    const ctx = context.alice();
    const parent: ResolversParentTypes["User"] = dto.users.alice;
    const args: UserTodoArgs = {
      id: graph.todos.alice1.id,
    };

    const result = await todo(ctx, parent, args);
    expect(result?.id).toBe(domain.todos.alice1.id);
  });
});
