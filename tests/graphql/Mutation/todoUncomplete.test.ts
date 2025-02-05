import { omit } from "es-toolkit";

import { client } from "../../../src/db/client.ts";
import { TodoStatus } from "../../../src/db/generated/types.ts";

import { Data, dummyId } from "../../data.ts";
import { clearTables } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoUncompleteMutation, TodoUncompleteMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  TodoUncompleteMutation,
  TodoUncompleteMutationVariables
>(/* GraphQL */ `
  mutation TodoUncomplete($id: ID!) {
    todoUncomplete(id: $id) {
      __typename
      ... on TodoUncompleteSuccess {
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
    .updateTable("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .set({ status: TodoStatus.DONE })
    .executeTakeFirstOrThrow();
});

test("invalid input", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: dummyId.todo().slice(0, -1) },
  });

  expect(data?.todoUncomplete?.__typename === "InvalidInputErrors").toBe(true);
});

test("not exists", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: dummyId.todo() },
  });

  expect(data?.todoUncomplete?.__typename === "ResourceNotFoundError").toBe(true);
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: Data.graph.aliceTodo.id },
  });

  expect(data?.todoUncomplete?.__typename === "ResourceNotFoundError").toBe(true);
});

it("should update status", async () => {
  const before = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.todoUncomplete?.__typename === "TodoUncompleteSuccess").toBe(true);

  const after = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.status).toBe(TodoStatus.DONE);
  expect(after.status).toBe(TodoStatus.PENDING);
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.todoUncomplete?.__typename === "TodoUncompleteSuccess").toBe(true);

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
    token: Data.token.admin,
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.todoUncomplete?.__typename === "TodoUncompleteSuccess").toBe(true);

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
