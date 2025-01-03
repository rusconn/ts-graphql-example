import { client } from "../../../../src/db/client.ts";

import { Data, dummyId } from "../../../data.ts";
import { clearTables, clearTodos } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { DeleteTodoMutation, DeleteTodoMutationVariables } from "../../schema.ts";

const executeMutation = executeSingleResultOperation<
  DeleteTodoMutation,
  DeleteTodoMutationVariables
>(/* GraphQL */ `
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      __typename
      ... on DeleteTodoSuccess {
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
  users: () => client.insertInto("User").values(testData.users).execute(),
  todos: () => client.insertInto("Todo").values(testData.todos).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

beforeEach(async () => {
  await clearTodos();
  await seedData.todos();
});

test("invalid input", async () => {
  const { data } = await executeMutation({
    variables: { id: dummyId.todo().slice(0, -1) },
  });

  expect(data?.deleteTodo?.__typename === "InvalidInputError").toBe(true);
});

test("not exists", async () => {
  const { data } = await executeMutation({
    variables: { id: dummyId.todo() },
  });

  expect(data?.deleteTodo?.__typename === "ResourceNotFoundError").toBe(true);
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.aliceTodo.id },
  });

  expect(data?.deleteTodo?.__typename === "ResourceNotFoundError").toBe(true);
});

it("should delete todo", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.deleteTodo?.__typename === "DeleteTodoSuccess").toBe(true);

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
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.deleteTodo?.__typename === "DeleteTodoSuccess").toBe(true);

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirst();

  const after = await client
    .selectFrom("Todo")
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  const beforeCount = Number(before.count);
  const afterCount = Number(after.count);

  expect(todo).toBeUndefined();
  expect(afterCount).toBe(beforeCount - 1);
});
