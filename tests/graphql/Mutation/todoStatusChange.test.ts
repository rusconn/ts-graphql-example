import { omit } from "es-toolkit";

import { client } from "../../../src/db/client.ts";
import { TodoStatus } from "../../../src/models/todo.ts";
import * as Graph from "../../../src/schema.ts";

import { db, dummyId, graph, tokens } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoStatusChangeMutation, TodoStatusChangeMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  TodoStatusChangeMutation,
  TodoStatusChangeMutationVariables
>(/* GraphQL */ `
  mutation TodoStatusChange($id: ID!, $status: TodoStatus!) {
    todoStatusChange(id: $id, status: $status) {
      __typename
      ... on TodoStatusChangeSuccess {
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
    .updateTable("todos")
    .where("id", "=", db.todos.admin1.id)
    .set({ status: TodoStatus.PENDING })
    .executeTakeFirstOrThrow();
});

test("invalid input", async () => {
  const { data, errors } = await executeMutation({
    token: tokens.admin,
    variables: { id: dummyId.todo().slice(0, -1), status: Graph.TodoStatus.Done },
  });

  expect(data?.todoStatusChange === null).toBe(true);
  expect(errors?.map((e) => e.extensions.code)).toStrictEqual([Graph.ErrorCode.BadUserInput]);
});

test("not exists", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: dummyId.todo(), status: Graph.TodoStatus.Done },
  });

  expect(data?.todoStatusChange?.__typename === "ResourceNotFoundError").toBe(true);
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.alice1.id, status: Graph.TodoStatus.Done },
  });

  expect(data?.todoStatusChange?.__typename === "ResourceNotFoundError").toBe(true);
});

it("should update status", async () => {
  const before = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.admin1.id, status: Graph.TodoStatus.Done },
  });

  expect(data?.todoStatusChange?.__typename === "TodoStatusChangeSuccess").toBe(true);

  const after = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.status).toBe(TodoStatus.PENDING);
  expect(after.status).toBe(TodoStatus.DONE);
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { id: graph.todos.admin1.id, status: Graph.TodoStatus.Done },
  });

  expect(data?.todoStatusChange?.__typename === "TodoStatusChangeSuccess").toBe(true);

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
    variables: { id: graph.todos.admin1.id, status: Graph.TodoStatus.Done },
  });

  expect(data?.todoStatusChange?.__typename === "TodoStatusChangeSuccess").toBe(true);

  const after = await client
    .selectFrom("todos")
    .where("id", "=", db.todos.admin1.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["status", "updatedAt"]);
  const afterToCompare = omit(after, ["status", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
