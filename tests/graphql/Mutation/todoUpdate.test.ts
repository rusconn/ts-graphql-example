import { omit } from "es-toolkit";

import { client } from "../../../src/db/client.ts";
import { ErrorCode, TodoStatus } from "../../../src/schema.ts";

import { db, dummyId, graph, tokens } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoUpdateMutation, TodoUpdateMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  TodoUpdateMutation,
  TodoUpdateMutationVariables
>(/* GraphQL */ `
  mutation TodoUpdate($id: ID!, $title: String, $description: String, $status: TodoStatus) {
    todoUpdate(id: $id, title: $title, description: $description, status: $status) {
      __typename
      ... on TodoUpdateSuccess {
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
  users: [db.users.admin, db.users.alice],
  todos: [db.todos.admin1, db.todos.alice1],
};

const seedData = {
  users: () => seed.user(testData.users),
  todos: () => seed.todo(testData.todos),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

beforeEach(async () => {
  await client
    .insertInto("todos")
    .values(db.todos.admin1)
    .onConflict((oc) => oc.column("id").doUpdateSet(db.todos.admin1))
    .executeTakeFirstOrThrow();
});

const variables = {
  title: "bar",
  description: "baz",
  status: TodoStatus.Done,
};

test("invalid input id", async () => {
  const { data, errors } = await executeMutation({
    token: tokens.admin,
    variables: { id: dummyId.todo().slice(0, -1), ...variables },
  });

  expect(data?.todoUpdate === null).toBe(true);
  expect(errors?.map((e) => e.extensions.code)).toStrictEqual([ErrorCode.BadUserInput]);
});

test("invalid input args", async () => {
  const invalidTitle = "A".repeat(100 + 1);

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: dummyId.todo(), ...variables, title: invalidTitle },
  });

  expect(data?.todoUpdate?.__typename === "InvalidInputErrors").toBe(true);
});

test("not exists", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: dummyId.todo() },
  });

  expect(data?.todoUpdate?.__typename === "ResourceNotFoundError").toBe(true);
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.alice1.id },
  });

  expect(data?.todoUpdate?.__typename === "ResourceNotFoundError").toBe(true);
});

it("should update using input", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.admin1.id, ...variables },
  });

  expect(data?.todoUpdate?.__typename === "TodoUpdateSuccess").toBe(true);

  const todo = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.title).toBe(variables.title);
  expect(todo.description).toBe(variables.description);
  expect(todo.status).toBe(variables.status);
});

it("should not update fields if the field is absent", async () => {
  const before = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.admin1.id },
  });

  expect(data?.todoUpdate?.__typename === "TodoUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.title).toBe(after.title);
  expect(before.description).toBe(after.description);
  expect(before.status).toBe(after.status);
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.admin1.id, ...variables },
  });

  expect(data?.todoUpdate?.__typename === "TodoUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.admin1.id, ...variables },
  });

  expect(data?.todoUpdate?.__typename === "TodoUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["title", "description", "status", "updatedAt"]);
  const afterToCompare = omit(after, ["title", "description", "status", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
