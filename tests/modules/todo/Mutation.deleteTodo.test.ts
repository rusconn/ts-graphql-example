import type { DeleteTodoMutation, DeleteTodoMutationVariables } from "tests/modules/schema.js";
import { DBData, GraphData } from "tests/data/mod.js";
import { clearTables, clearTodos } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";

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
  users: [DBData.admin, DBData.alice],
  todos: [DBData.adminTodo1, DBData.aliceTodo],
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
    variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
  });

  expect(data?.deleteTodo?.__typename).toBe("TodoNotFoundError");
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { id: GraphData.aliceTodo.id },
  });

  expect(data?.deleteTodo?.__typename).toBe("TodoNotFoundError");
});

it("should delete todo", async () => {
  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id },
  });

  expect(data?.deleteTodo?.__typename).toBe("DeleteTodoSuccess");

  const todo = await prisma.todo.findUnique({
    where: { id: DBData.adminTodo1.id },
  });

  expect(todo).toBeNull();
});

it("should not delete others", async () => {
  const before = await prisma.todo.count();

  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id },
  });

  expect(data?.deleteTodo?.__typename).toBe("DeleteTodoSuccess");

  const todo = await prisma.todo.findUnique({
    where: { id: DBData.adminTodo1.id },
  });

  const after = await prisma.todo.count();

  expect(todo).toBeNull();
  expect(after).toBe(before - 1);
});
