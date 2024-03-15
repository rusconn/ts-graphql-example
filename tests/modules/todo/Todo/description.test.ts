import { ErrorCode } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { Data } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { TodoDescriptionQuery, TodoDescriptionQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeQuery = executeSingleResultOperation<
  TodoDescriptionQuery,
  TodoDescriptionQueryVariables
>(/* GraphQL */ `
  query TodoDescription($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        description
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

test("not exists", async () => {
  const { errors } = await executeQuery({
    variables: { id: Data.graph.adminTodo.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.description).toBe(Data.graph.adminTodo.description);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.description).toBeNull();
});
