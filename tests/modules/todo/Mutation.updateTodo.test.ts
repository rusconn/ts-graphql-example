import { omit } from "remeda";

import type { UpdateTodoMutation, UpdateTodoMutationVariables } from "tests/modules/schema.ts";
import { DBData, GraphData } from "tests/data/mod.ts";
import { clearTables } from "tests/helpers.ts";
import { executeSingleResultOperation } from "tests/server.ts";
import { prisma } from "@/prisma/mod.ts";
import { TodoStatus } from "@/modules/common/schema.ts";

const executeMutation = executeSingleResultOperation<
  UpdateTodoMutation,
  UpdateTodoMutationVariables
>(/* GraphQL */ `
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      __typename
      ... on UpdateTodoSuccess {
        todo {
          id
          updatedAt
          title
          description
          status
        }
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
  await prisma.todo.upsert({
    where: { id: DBData.adminTodo1.id },
    create: DBData.adminTodo1,
    update: DBData.adminTodo1,
  });
});

const input = {
  title: "bar",
  description: "baz",
  status: TodoStatus.Done,
};

test("not exists", async () => {
  const { data } = await executeMutation({
    variables: { input: {}, id: GraphData.adminTodo1.id.slice(0, -1) },
  });

  expect(data?.updateTodo?.__typename).toBe("TodoNotFoundError");
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { input: {}, id: GraphData.aliceTodo.id },
  });

  expect(data?.updateTodo?.__typename).toBe("TodoNotFoundError");
});

it("should update using input", async () => {
  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id, input },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const todo = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  expect(todo.title).toBe(input.title);
  expect(todo.description).toBe(input.description);
  expect(todo.status).toBe(input.status);
});

it("should not update fields if the field is absent", async () => {
  const before = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id, input: {} },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const after = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  expect(before.title).toBe(after.title);
  expect(before.description).toBe(after.description);
  expect(before.status).toBe(after.status);
});

it("should update updatedAt", async () => {
  const before = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id, input },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const after = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id, input },
  });

  expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

  const after = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["title", "description", "status", "updatedAt"]);
  const afterToCompare = omit(after, ["title", "description", "status", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
