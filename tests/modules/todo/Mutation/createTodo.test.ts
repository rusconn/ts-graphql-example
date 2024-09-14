import { db } from "@/db/client.ts";
import { TodoStatus } from "@/db/types.ts";
import { parseTodoNodeId } from "@/modules/todo/common/parser.ts";

import { Data } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { CreateTodoMutation, CreateTodoMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

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

it("should create todo using input", async () => {
  const { data } = await executeMutation({
    variables: { input },
  });

  if (data?.createTodo?.__typename !== "CreateTodoSuccess") {
    fail();
  }

  const id = parseTodoNodeId(data.createTodo.todo.id);

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

  const todo = await db
    .selectFrom("Todo")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(todo.status).toBe(TodoStatus.PENDING);
});
