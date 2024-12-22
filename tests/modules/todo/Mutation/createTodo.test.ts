import { db } from "../../../../src/db/client.ts";
import { TodoStatus } from "../../../../src/db/types.ts";
import { parseTodoNodeId } from "../../../../src/modules/todo/parsers.ts";

import { Data } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { CreateTodoMutation, CreateTodoMutationVariables } from "../../schema.ts";

const executeMutation = executeSingleResultOperation<
  CreateTodoMutation,
  CreateTodoMutationVariables
>(/* GraphQL */ `
  mutation CreateTodo($title: NonEmptyString!, $description: String) {
    createTodo(title: $title, description: $description) {
      __typename
      ... on CreateTodoSuccess {
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
  users: () => db.insertInto("User").values(testData.users).execute(),
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

  expect(data?.createTodo?.__typename === "InvalidInputError").toBe(true);
});

it("should create todo using input", async () => {
  const { data } = await executeMutation({
    variables,
  });

  if (data?.createTodo?.__typename !== "CreateTodoSuccess") {
    fail();
  }

  const id = parseTodoNodeId(data.createTodo.todo.id);

  if (id instanceof Error) {
    fail();
  }

  const todo = await db
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.title).toBe(variables.title);
  expect(todo.description).toBe(variables.description);
});

test('description should be "" by default', async () => {
  const { data } = await executeMutation({
    variables: { title: variables.title },
  });

  if (data?.createTodo?.__typename !== "CreateTodoSuccess") {
    fail();
  }

  const id = parseTodoNodeId(data.createTodo.todo.id);

  if (id instanceof Error) {
    fail();
  }

  const todo = await db
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.description).toBe("");
});

test("status should be PENDING by default", async () => {
  const { data } = await executeMutation({
    variables,
  });

  if (data?.createTodo?.__typename !== "CreateTodoSuccess") {
    fail();
  }

  const id = parseTodoNodeId(data.createTodo.todo.id);

  if (id instanceof Error) {
    fail();
  }

  const todo = await db
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.status).toBe(TodoStatus.PENDING);
});
