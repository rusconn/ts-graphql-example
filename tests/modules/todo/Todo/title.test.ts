import { ErrorCode } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { ContextData, DBData, GraphData } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { TodoTitleQuery, TodoTitleQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeQuery = executeSingleResultOperation<
  TodoTitleQuery,
  TodoTitleQueryVariables
>(/* GraphQL */ `
  query TodoTitle($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        title
      }
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice],
  todos: [DBData.adminTodo, DBData.aliceTodo],
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
    variables: { id: GraphData.adminTodo.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    variables: { id: GraphData.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.title).toBe(GraphData.adminTodo.title);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: ContextData.alice,
    variables: { id: GraphData.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.title).toBeNull();
});
