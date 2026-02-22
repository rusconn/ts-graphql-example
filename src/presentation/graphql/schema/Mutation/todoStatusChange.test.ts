import { omit } from "es-toolkit";
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
import { domain, dto, graph } from "../_test/data.ts";
import { createContext, dummyId } from "../_test/helpers.ts";
import { ErrorCode, type MutationTodoStatusChangeArgs, TodoStatus } from "../_types.ts";
import { resolver } from "./todoStatusChange.ts";

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

const todoStatusChange = async (
  ctx: ContextForIT, //
  args: MutationTodoStatusChangeArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: MutationTodoStatusChangeArgs = {
    id: graph.todos.alice1.id,
    status: TodoStatus.Done,
  };

  it("rejects when user is not authenticated", async () => {
    const ctx = context.guest();

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    await expect(todoStatusChange(ctx, args)).rejects.toSatisfy(
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
      await todoStatusChange(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("throws an input error when id is invalid", async () => {
    const ctx = context.alice();
    const args: MutationTodoStatusChangeArgs = {
      id: "bad-id",
      status: TodoStatus.Done,
    };

    await expect(todoStatusChange(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when id is valid", async () => {
    const ctx = context.alice();
    const args: MutationTodoStatusChangeArgs = {
      id: dummyId.todo(),
      status: TodoStatus.Done,
    };

    try {
      await todoStatusChange(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("usecase", () => {
  it("returns not-found when id not exists on graph", async () => {
    const ctx = context.alice();
    const args: MutationTodoStatusChangeArgs = {
      id: dummyId.todo(),
      status: TodoStatus.Done,
    };

    const result = await todoStatusChange(ctx, args);
    expect(result?.__typename).toBe("ResourceNotFoundError");
  });

  it("returns not-found when user does not own todo", async () => {
    await seeders.users(domain.users.admin);
    await seeders.todos(domain.todos.admin1);

    const args: MutationTodoStatusChangeArgs = {
      id: graph.todos.admin1.id,
      status: TodoStatus.Done,
    };

    const result1 = await todoStatusChange(context.admin(), args);
    expect(result1?.__typename).not.toBe("ResourceNotFoundError");

    const result2 = await todoStatusChange(context.alice(), args);
    expect(result2?.__typename).toBe("ResourceNotFoundError");
  });

  it("changes status using args", async () => {
    const ctx = context.alice();
    const args: MutationTodoStatusChangeArgs = {
      id: graph.todos.alice1.id,
      status: TodoStatus.Done,
    };

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    const result = await todoStatusChange(ctx, args);
    assert(result?.__typename === "TodoStatusChangeSuccess", result?.__typename);
    const changed = result.todo;
    expect(omit(changed, ["status", "updatedAt"])).toStrictEqual(
      omit(before, ["status", "updatedAt"]),
    );
    expect(changed.status).toBe(Domain.Todo.Status.DONE);
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.todo.findOrThrow(dto.todos.alice1.id);
    expect(after).toStrictEqual(changed);
  });

  it("changes only updatedAt when statuses are the same", async () => {
    const ctx = context.alice();
    const args: MutationTodoStatusChangeArgs = {
      id: graph.todos.alice1.id,
      status: TodoStatus.Pending,
    };

    const before = await queries.todo.findOrThrow(dto.todos.alice1.id);

    const result = await todoStatusChange(ctx, args);
    assert(result?.__typename === "TodoStatusChangeSuccess", result?.__typename);
    const changed = result.todo;
    expect(omit(changed, ["updatedAt"])).toStrictEqual(omit(before, ["updatedAt"]));
    expect(changed.updatedAt.getTime()).toBeGreaterThan(before.updatedAt.getTime());

    const after = await queries.todo.findOrThrow(dto.todos.alice1.id);
    expect(after).toStrictEqual(changed);
  });
});
