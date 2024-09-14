import { omit } from "remeda";

import { db } from "@/db/client.ts";
import { TodoStatus } from "@/modules/common/schema.ts";

import { Data } from "tests/data.ts";
import { clearTables } from "tests/helpers.ts";
import type { UpdateTodoMutation, UpdateTodoMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeMutation = executeSingleResultOperation<
  UpdateTodoMutation,
  UpdateTodoMutationVariables
>(/* GraphQL */ `
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      __typename
      ... on UpdateTodoSuccess {
        todo {
          id
          updatedAt
          title
          description
          status
        }
      }
      ... on TodoNotFoundError {
        message
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
};

const seedData = {
  users: () => db.insertInto("User").values(testData.users).execute(),
  todos: () => db.insertInto("Todo").values(testData.todos).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

beforeEach(async () => {
  await db
    .insertInto("Todo")
    .values(Data.db.adminTodo)
    .onConflict((oc) => oc.column("id").doUpdateSet(Data.db.adminTodo))
    .executeTakeFirstOrThrow();
});

const input = {
  title: "bar",
  description: "baz",
  status: TodoStatus.Done,
};

test("not exists", async () => {
  const { data } = await executeMutation({
    variables: { input: {}, id: Data.graph.adminTodo.id.slice(0, -1) },
  });

  expect(data?.updateTodo?.__typename).toBe("TodoNotFoundError");
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { input: {}, id: Data.graph.aliceTodo.id },
  });

  expect(data?.updateTodo?.__typename).toBe("TodoNotFoundError");
});

it("should update using input", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id, input },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const todo = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.title).toBe(input.title);
  expect(todo.description).toBe(input.description);
  expect(todo.status).toBe(input.status);
});

it("should not update fields if the field is absent", async () => {
  const before = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id, input: {} },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const after = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.title).toBe(after.title);
  expect(before.description).toBe(after.description);
  expect(before.status).toBe(after.status);
});

it("should update updatedAt", async () => {
  const before = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id, input },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const after = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id, input },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const after = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["title", "description", "status", "updatedAt"]);
  const afterToCompare = omit(after, ["title", "description", "status", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
