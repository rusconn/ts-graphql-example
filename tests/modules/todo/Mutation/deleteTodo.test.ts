import { prisma } from "@/prisma/mod.ts";

import { Data } from "tests/data.ts";
import { clearTables, clearTodos } from "tests/helpers.ts";
import type { DeleteTodoMutation, DeleteTodoMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

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
      ... on TodoNotFoundError {
        message
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
  todos: () => prisma.todo.createMany({ data: testData.todos }),
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

test("not exists", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id.slice(0, -1) },
  });

  expect(data?.deleteTodo?.__typename).toBe("TodoNotFoundError");
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.aliceTodo.id },
  });

  expect(data?.deleteTodo?.__typename).toBe("TodoNotFoundError");
});

it("should delete todo", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.deleteTodo?.__typename).toBe("DeleteTodoSuccess");

  const todo = await prisma.todo.findUnique({
    where: { id: Data.db.adminTodo.id },
  });

  expect(todo).toBeNull();
});

it("should not delete others", async () => {
  const before = await prisma.todo.count();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.deleteTodo?.__typename).toBe("DeleteTodoSuccess");

  const todo = await prisma.todo.findUnique({
    where: { id: Data.db.adminTodo.id },
  });

  const after = await prisma.todo.count();

  expect(todo).toBeNull();
  expect(after).toBe(before - 1);
});
