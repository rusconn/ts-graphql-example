import { client } from "../../../src/db/client.ts";
import { TodoStatus } from "../../../src/db/types.ts";
import { parseTodoId } from "../../../src/graphql/_parsers/todo/id.ts";

import { Data } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoCreateMutation, TodoCreateMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  TodoCreateMutation,
  TodoCreateMutationVariables
>(/* GraphQL */ `
  mutation TodoCreate($title: String!, $description: String) {
    todoCreate(title: $title, description: $description) {
      __typename
      ... on TodoCreateSuccess {
        todo {
          id
          title
          description
          status
        }
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin],
};

const seedData = {
  users: () => seed.user(testData.users),
};

beforeEach(async () => {
  await clearTables();
  await seedData.users();
});

const variables = {
  title: "foo",
  description: "bar",
};

test("invalid input", async () => {
  const invalidTitle = "A".repeat(100 + 1);

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { ...variables, title: invalidTitle },
  });

  expect(data?.todoCreate?.__typename === "InvalidInputErrors").toBe(true);
});

it("should create todo using input", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables,
  });

  if (data?.todoCreate?.__typename !== "TodoCreateSuccess") {
    fail();
  }

  const id = parseTodoId(data.todoCreate.todo.id);

  if (id instanceof Error) {
    fail();
  }

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.title).toBe(variables.title);
  expect(todo.description).toBe(variables.description);
});

test('description should be "" by default', async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { title: variables.title },
  });

  if (data?.todoCreate?.__typename !== "TodoCreateSuccess") {
    fail();
  }

  const id = parseTodoId(data.todoCreate.todo.id);

  if (id instanceof Error) {
    fail();
  }

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.description).toBe("");
});

test("status should be PENDING by default", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables,
  });

  if (data?.todoCreate?.__typename !== "TodoCreateSuccess") {
    fail();
  }

  const id = parseTodoId(data.todoCreate.todo.id);

  if (id instanceof Error) {
    fail();
  }

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.status).toBe(TodoStatus.PENDING);
});
