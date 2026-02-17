import { omit } from "es-toolkit";
import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../infra/datasources/_shared/generated.ts";
import { kysely } from "../../infra/datasources/db/client.ts";
import { ErrorCode, type MutationTodoUpdateArgs } from "../_schema.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { domain, dto, graph } from "../_test/data.ts";
import {
  createContext,
  createQueries,
  createSeeders,
  dummyId,
  type Queries,
  type Seeders,
} from "../_test/helpers.ts";
import { resolver } from "./todoUpdate.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;
let queries: Queries;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  queries = createQueries(trx);
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice);
  await seeders.todos(domain.todos.alice1);
});

afterEach(async () => {
  await trx.rollback().execute();
});

const todoUpdate = async (
  ctx: ContextForIT, //
  args: MutationTodoUpdateArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationTodoUpdateArgs = {
    id: graph.todos.alice1.id,
    title: "foo",
    description: "bar",
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    await expect(todoUpdate(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );

    const after = await queries.todo.findOrThrow(dto.todos.alice1.id);
    expect(after).toStrictEqual(before);
  });

  it("not rejects when user is authenticated", async () => {
    const ctx = context.alice();

    try {
      await todoUpdate(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = context.alice();
    const args: MutationTodoUpdateArgs = {
      id: "bad-id",
    };

    await expect(todoUpdate(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = context.alice();
    const args: MutationTodoUpdateArgs = {
      id: dummyId.todo(),
    };

    try {
      await todoUpdate(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });

  it("returns input errors when args is invalid", async () => {
    const ctx = context.alice();
    const args: MutationTodoUpdateArgs = {
      id: graph.todos.alice1.id,
      title: null,
    };

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    const result = await todoUpdate(ctx, args);
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field)).toStrictEqual(["title"]);

    const after = await queries.todo.findOrThrow(dto.todos.alice1.id);
    expect(after).toStrictEqual(before);
  });

  it("not returns input errors when args is valid", async () => {
    const ctx = context.alice();
    const args: MutationTodoUpdateArgs = {
      id: graph.todos.alice1.id,
    };

    const result = await todoUpdate(ctx, args);
    expect(result?.__typename).not.toBe("InvalidInputErrors");
  });
});

describe("logic", () => {
  it("returns not-found when id not exists on graph", async () => {
    const ctx = context.alice();
    const args: MutationTodoUpdateArgs = {
      id: dummyId.todo(),
    };

    const result = await todoUpdate(ctx, args);
    expect(result?.__typename).toBe("ResourceNotFoundError");
  });

  it("returns not-found when user does not own todo", async () => {
    await seeders.users(domain.users.admin);
    await seeders.todos(domain.todos.admin1);

    const args: MutationTodoUpdateArgs = {
      id: graph.todos.admin1.id,
    };

    const result1 = await todoUpdate(context.admin(), args);
    expect(result1?.__typename).not.toBe("ResourceNotFoundError");

    const result2 = await todoUpdate(context.alice(), args);
    expect(result2?.__typename).toBe("ResourceNotFoundError");
  });

  it("updates todo using args", async () => {
    const ctx = context.alice();
    const args: MutationTodoUpdateArgs = {
      id: graph.todos.alice1.id,
      title: "foo",
      description: "bar",
    };

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    const result = await todoUpdate(ctx, args);
    assert(result?.__typename === "TodoUpdateSuccess", result?.__typename);
    const updated = result.todo;
    expect(omit(updated, ["title", "description", "updatedAt"])).toStrictEqual(
      omit(before, ["title", "description", "updatedAt"]),
    );
    expect(updated.title).toBe("foo");
    expect(updated.description).toBe("bar");
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.todo.findOrThrow(dto.todos.alice1.id);
    expect(after).toStrictEqual(updated);
  });

  it("updates only updatedAt when args is empty", async () => {
    const ctx = context.alice();
    const args: MutationTodoUpdateArgs = {
      id: graph.todos.alice1.id,
    };

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    const result = await todoUpdate(ctx, args);
    assert(result?.__typename === "TodoUpdateSuccess", result?.__typename);
    const updated = result.todo;
    expect(omit(updated, ["updatedAt"])).toStrictEqual(omit(before, ["updatedAt"]));
    expect(updated.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.todo.findOrThrow(dto.todos.alice1.id);
    expect(after).toStrictEqual(updated);
  });
});
