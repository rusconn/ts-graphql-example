import type { ControlledTransaction } from "kysely";

import * as Domain from "../../domain/entities.ts";
import type { DB } from "../../infra/datasources/_shared/generated.ts";
import { kysely } from "../../infra/datasources/db/client.ts";
import { domain } from "../_test/data/domain.ts";
import { createContext, createSeeder } from "../_test/helpers.ts";
import { resolver as todoCreate } from "./todoCreate.ts";

let trx: ControlledTransaction<DB>;

beforeEach(async () => {
  trx = await kysely.startTransaction().execute();
  const seeder = createSeeder(trx);
  await seeder.users(domain.users.alice);
});

afterEach(async () => {
  await trx.rollback().execute();
});

it("returns validation errors when input is invalid", async () => {
  // precondition
  {
    const todos = await trx
      .selectFrom("todos")
      .where("userId", "=", domain.users.alice.id)
      .select("id")
      .execute();
    expect(todos.length).toBe(0);
  }

  // act
  {
    const result = await todoCreate(
      {},
      {
        title: "a".repeat(Domain.Todo.Title.MAX + 1),
        description: "a".repeat(Domain.Todo.Description.MAX + 1),
      },
      createContext({ user: domain.users.alice, trx }),
    );
    assert(result?.__typename === "InvalidInputErrors", result?.__typename);
    expect(result.errors.map((e) => e.field).sort()).toStrictEqual(["description", "title"]);
  }

  // postcondition
  {
    const todos = await trx
      .selectFrom("todos")
      .where("userId", "=", domain.users.alice.id)
      .select("id")
      .execute();
    expect(todos.length).toBe(0);
  }
});

it("creates a todo using input", async () => {
  // precondition
  {
    const todos = await trx
      .selectFrom("todos")
      .where("userId", "=", domain.users.alice.id)
      .select("id")
      .execute();
    expect(todos.length).toBe(0);
  }

  // act
  let todoId;
  {
    const result = await todoCreate(
      {},
      {
        title: "foo",
        description: "bar",
      },
      createContext({ user: domain.users.alice, trx }),
    );
    assert(result?.__typename === "TodoCreateSuccess", result?.__typename);
    expect(result.todo.title).toBe("foo");
    expect(result.todo.description).toBe("bar");
    todoId = result.todo.id;
  }

  // postcondition
  {
    const todos = await trx
      .selectFrom("todos")
      .where("userId", "=", domain.users.alice.id)
      .select("id")
      .execute();
    expect(todos.length).toBe(1);

    const todo = await trx
      .selectFrom("todos") //
      .where("id", "=", todoId)
      .selectAll()
      .executeTakeFirstOrThrow();
    expect(todo.title).toBe("foo");
    expect(todo.description).toBe("bar");
  }
});
