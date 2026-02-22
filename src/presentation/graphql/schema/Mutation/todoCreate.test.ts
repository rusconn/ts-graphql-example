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
import { domain } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type MutationTodoCreateArgs } from "../_types.ts";
import { resolver } from "./todoCreate.ts";

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

const todoCreate = async (
  ctx: ContextForIT, //
  args: MutationTodoCreateArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationTodoCreateArgs = {
    title: "foo",
    description: "bar",
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    const before = await queries.todo.count();

    await expect(todoCreate(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );

    const after = await queries.todo.count();
    expect(after).toBe(before);
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await todoCreate(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationTodoCreateArgs = {
      title: "a".repeat(Domain.Todo.Title.MAX + 1),
      description: "bar",
    };

    const before = await queries.todo.countTheirs(ctx.user.id);

    const result = await todoCreate(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["title"]);

    const after = await queries.todo.countTheirs(ctx.user.id);
    expect(after).toBe(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationTodoCreateArgs = {
      title: "foo",
      description: "bar",
    };

    const result = await todoCreate(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("usecase", () => {
  it("creates a todo using args", async () => {
    const ctx = context.alice();
    const args: MutationTodoCreateArgs = {
      title: "foo",
      description: "bar",
    };

    const before = await queries.todo.countTheirs(ctx.user.id);

    const result = await todoCreate(ctx, args);
    assert(result?.__typename === "TodoCreateSuccess", result?.__typename);
    const created = result.todo;
    expect(created.title).toBe("foo");
    expect(created.description).toBe("bar");

    const after = await queries.todo.countTheirs(ctx.user.id);
    expect(after).toBe(before + 1);

    const stored = await queries.todo.findOrThrow(created.id);
    expect(stored).toStrictEqual(created);
  });
});
