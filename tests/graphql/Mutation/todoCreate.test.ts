import { client } from "../../../src/db/client.ts";
import { TodoStatus } from "../../../src/db/generated/types.ts";
import { parseTodoId } from "../../../src/graphql/_parsers/todo/id.ts";

import { Data } from "../../data.ts";
import { clearTables, fail } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoCreateMutation, TodoCreateMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  TodoCreateMutation,
  TodoCreateMutationVariables
>(/* GraphQL */ `
  mutation TodoCreate($title: NonEmptyString!, $description: String) {
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
  users: () => client.insertInto("User").values(testData.users).execute(),
};

beforeAll(async () => {
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
    variables: { ...variables, title: invalidTitle },
  });

  expect(data?.todoCreate?.__typename === "InvalidInputError").toBe(true);
});

it("should create todo using input", async () => {
  const { data } = await executeMutation({
    variables,
  });

  if (data?.todoCreate?.__typename !== "TodoCreateSuccess") {
    fail();
  }

  const parsed = parseTodoId(data.todoCreate.todo);

  if (parsed instanceof Error) {
    fail();
  }

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", parsed)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.title).toBe(variables.title);
  expect(todo.description).toBe(variables.description);
});

test('description should be "" by default', async () => {
  const { data } = await executeMutation({
    variables: { title: variables.title },
  });

  if (data?.todoCreate?.__typename !== "TodoCreateSuccess") {
    fail();
  }

  const parsed = parseTodoId(data.todoCreate.todo);

  if (parsed instanceof Error) {
    fail();
  }

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", parsed)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.description).toBe("");
});

test("status should be PENDING by default", async () => {
  const { data } = await executeMutation({
    variables,
  });

  if (data?.todoCreate?.__typename !== "TodoCreateSuccess") {
    fail();
  }

  const parsed = parseTodoId(data.todoCreate.todo);

  if (parsed instanceof Error) {
    fail();
  }

  const todo = await client
    .selectFrom("Todo")
    .where("id", "=", parsed)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.status).toBe(TodoStatus.PENDING);
});
