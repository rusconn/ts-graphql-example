import { omit } from "remeda";

import type {
  UncompleteTodoMutation,
  UncompleteTodoMutationVariables,
} from "tests/modules/schema.ts";
import { DBData, GraphData } from "tests/data/mod.ts";
import { clearTables } from "tests/helpers.ts";
import { executeSingleResultOperation } from "tests/server.ts";
import { prisma } from "@/prisma/mod.ts";
import * as Prisma from "@/prisma/mod.ts";
import { TodoStatus } from "@/modules/common/schema.ts";

const executeMutation = executeSingleResultOperation<
  UncompleteTodoMutation,
  UncompleteTodoMutationVariables
>(/* GraphQL */ `
  mutation UncompleteTodo($id: ID!) {
    uncompleteTodo(id: $id) {
      __typename
      ... on UncompleteTodoSuccess {
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
  await prisma.todo.update({
    where: { id: DBData.adminTodo1.id },
    data: { status: Prisma.TodoStatus.DONE },
  });
});

test("not exists", async () => {
  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
  });

  expect(data?.uncompleteTodo?.__typename).toBe("TodoNotFoundError");
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { id: GraphData.aliceTodo.id },
  });

  expect(data?.uncompleteTodo?.__typename).toBe("TodoNotFoundError");
});

it("should update status", async () => {
  const before = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id },
  });

  expect(data?.uncompleteTodo?.__typename).toBe("UncompleteTodoSuccess");

  const after = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  expect(before.status).toBe(TodoStatus.Done);
  expect(after.status).toBe(TodoStatus.Pending);
});

it("should update updatedAt", async () => {
  const before = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  const { data } = await executeMutation({
    variables: { id: GraphData.adminTodo1.id },
  });

  expect(data?.uncompleteTodo?.__typename).toBe("UncompleteTodoSuccess");

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
    variables: { id: GraphData.adminTodo1.id },
  });

  expect(data?.uncompleteTodo?.__typename).toBe("UncompleteTodoSuccess");

  const after = await prisma.todo.findUniqueOrThrow({
    where: { id: DBData.adminTodo1.id },
  });

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["status", "updatedAt"]);
  const afterToCompare = omit(after, ["status", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
