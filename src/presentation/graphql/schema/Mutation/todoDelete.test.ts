import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
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
import { ErrorCode, type MutationTodoDeleteArgs } from "../_types.ts";
import { resolver } from "./todoDelete.ts";

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

const todoDelete = async (
  ctx: ContextForIT, //
  args: MutationTodoDeleteArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationTodoDeleteArgs = {
    id: graph.todos.alice1.id,
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    await expect(todoDelete(ctx, args)).rejects.toSatisfy(
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
      await todoDelete(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = context.alice();
    const args: MutationTodoDeleteArgs = {
      id: "bad-id",
    };

    await expect(todoDelete(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = context.alice();
    const args: MutationTodoDeleteArgs = {
      id: dummyId.todo(),
    };

    try {
      await todoDelete(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("usecase", () => {
  it("returns an error when id not exists on graph", async () => {
    const ctx = context.alice();
    const args: MutationTodoDeleteArgs = {
      id: dummyId.todo(),
    };

    const result = await todoDelete(ctx, args);
    expect(result?.__typename).toBe("ResourceNotFoundError");
  });

  it("returns an error when user does not own todo", async () => {
    await seeders.users(domain.users.admin);
    await seeders.todos(domain.todos.admin1);

    const args: MutationTodoDeleteArgs = {
      id: graph.todos.admin1.id,
    };

    const before = await queries.todo.count();
    expect(before).toBe(2);

    const result1 = await todoDelete(context.alice(), args);
    expect(result1?.__typename).toBe("ResourceNotFoundError");

    const after = await queries.todo.count();
    expect(after).toBe(before);

    const result2 = await todoDelete(context.admin(), args);
    expect(result2?.__typename).not.toBe("ResourceNotFoundError");
  });

  it("deletes todo", async () => {
    const ctx = context.alice();
    const args: MutationTodoDeleteArgs = {
      id: graph.todos.alice1.id,
    };

    const before = await queries.todo.countTheirs(dto.users.alice.id);
    expect(before).toBe(1);

    const result = await todoDelete(ctx, args);
    assert(result?.__typename === "TodoDeleteSuccess", result?.__typename);
    expect(result.id).toBe(args.id);

    const after = await queries.todo.countTheirs(dto.users.alice.id);
    expect(after).toBe(before - 1);
  });
});
