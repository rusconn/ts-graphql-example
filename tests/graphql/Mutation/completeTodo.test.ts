import { omit } from "es-toolkit";

import { client } from "../../../src/db/client.ts";
import { TodoStatus } from "../../../src/db/generated/types.ts";

import { Data, dummyId } from "../../data.ts";
import { clearTables } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { CompleteTodoMutation, CompleteTodoMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  CompleteTodoMutation,
  CompleteTodoMutationVariables
>(/* GraphQL */ `
  mutation CompleteTodo($id: ID!) {
    completeTodo(id: $id) {
      __typename
      ... on CompleteTodoSuccess {
        todo {
          id
          updatedAt
          title
          description
          status
        }
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
};

const seedData = {
  users: () => client.insertInto("User").values(testData.users).execute(),
  todos: () => client.insertInto("Todo").values(testData.todos).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

beforeEach(async () => {
  await client
    .insertInto("Todo")
    .values(Data.db.adminTodo)
    .onConflict((oc) => oc.column("id").doUpdateSet(Data.db.adminTodo))
    .executeTakeFirstOrThrow();
});

test("invalid input", async () => {
  const { data } = await executeMutation({
    variables: { id: dummyId.todo().slice(0, -1) },
  });

  expect(data?.completeTodo?.__typename === "InvalidInputError").toBe(true);
});

test("not exists", async () => {
  const { data } = await executeMutation({
    variables: { id: dummyId.todo() },
  });

  expect(data?.completeTodo?.__typename === "ResourceNotFoundError").toBe(true);
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.aliceTodo.id },
  });

  expect(data?.completeTodo?.__typename === "ResourceNotFoundError").toBe(true);
});

it("should update status", async () => {
  const before = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.completeTodo?.__typename === "CompleteTodoSuccess").toBe(true);

  const after = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.status).toBe(TodoStatus.PENDING);
  expect(after.status).toBe(TodoStatus.DONE);
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.completeTodo?.__typename === "CompleteTodoSuccess").toBe(true);

  const after = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.completeTodo?.__typename === "CompleteTodoSuccess").toBe(true);

  const after = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["status", "updatedAt"]);
  const afterToCompare = omit(after, ["status", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
