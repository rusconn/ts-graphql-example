import { db } from "../../../../src/db/client.ts";
import { TodoStatus } from "../../../../src/db/types.ts";
import { parseTodoNodeId } from "../../../../src/modules/todo/common/parser.ts";

import { Data } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { CreateTodoMutation, CreateTodoMutationVariables } from "../../schema.ts";

const executeMutation = executeSingleResultOperation<
  CreateTodoMutation,
  CreateTodoMutationVariables
>(/* GraphQL */ `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
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

const input = {
  title: "foo",
  description: "bar",
};

test("invalid input", async () => {
  const invalidTitle = "A".repeat(100 + 1);

  const { data } = await executeMutation({
    variables: { input: { ...input, title: invalidTitle } },
  });

  expect(data?.createTodo?.__typename === "InvalidInputError").toBe(true);
});

it("should create todo using input", async () => {
  const { data } = await executeMutation({
    variables: { input },
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

  expect(todo.title).toBe(input.title);
  expect(todo.description).toBe(input.description);
});

test("status should be PENDING by default", async () => {
  const { data } = await executeMutation({
    variables: { input },
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
