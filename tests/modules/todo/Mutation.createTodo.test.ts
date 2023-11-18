import type { CreateTodoMutation, CreateTodoMutationVariables } from "tests/modules/schema.ts";
import { DBData } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import { executeSingleResultOperation } from "tests/server.ts";
import { prisma } from "@/prisma/mod.ts";
import * as Prisma from "@/prisma/mod.ts";
import { parseTodoNodeId } from "@/modules/todo/common/parser.ts";

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
  users: [DBData.admin],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
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

  const todo = await prisma.todo.findUniqueOrThrow({
    where: { id },
  });

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

  const todo = await prisma.todo.findUniqueOrThrow({
    where: { id },
  });

  expect(todo.status).toBe(Prisma.TodoStatus.PENDING);
});
