import { client } from "../../../src/db/client.ts";
import { ErrorCode } from "../../../src/schema.ts";

import { Data, dummyId } from "../../data.ts";
import { clearTables, clearTodos, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoDeleteMutation, TodoDeleteMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  TodoDeleteMutation,
  TodoDeleteMutationVariables
>(/* GraphQL */ `
  mutation TodoDelete($id: ID!) {
    todoDelete(id: $id) {
      __typename
      ... on TodoDeleteSuccess {
        id
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
};

const seedData = {
  users: () => seed.user(testData.users),
  todos: () => seed.todo(testData.todos),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

beforeEach(async () => {
  await clearTodos();
  await seedData.todos();
});

test("invalid input", async () => {
  const { data, errors } = await executeMutation({
    token: Data.token.admin,
    variables: { id: dummyId.todo().slice(0, -1) },
  });

  expect(data?.todoDelete === null).toBe(true);
  expect(errors?.map((e) => e.extensions.code)).toStrictEqual([ErrorCode.BadUserInput]);
});

test("not exists", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: dummyId.todo() },
  });

  expect(data?.todoDelete?.__typename === "ResourceNotFoundError").toBe(true);
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: Data.graph.aliceTodo.id },
  });

  expect(data?.todoDelete?.__typename === "ResourceNotFoundError").toBe(true);
});

it("should delete todo", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.todoDelete?.__typename === "TodoDeleteSuccess").toBe(true);

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirst();

  expect(todo).toBeUndefined();
});

it("should not delete others", async () => {
  const before = await client
    .selectFrom("Todo")
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.todoDelete?.__typename === "TodoDeleteSuccess").toBe(true);

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirst();

  const after = await client
    .selectFrom("Todo")
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();

  expect(todo).toBeUndefined();
  expect(after.count).toBe(before.count - 1);
});
