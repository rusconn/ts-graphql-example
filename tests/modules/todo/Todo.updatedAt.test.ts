import type { TodoUpdatedAtQuery, TodoUpdatedAtQueryVariables } from "tests/modules/schema.js";
import { ContextData, DBData, GraphData } from "tests/data/mod.js";
import { clearTables, fail } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import { ErrorCode } from "@/modules/common/schema.js";

const executeQuery = executeSingleResultOperation<
  TodoUpdatedAtQuery,
  TodoUpdatedAtQueryVariables
>(/* GraphQL */ `
  query TodoUpdatedAt($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        updatedAt
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

test("not exists", async () => {
  const { errors } = await executeQuery({
    variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    variables: { id: GraphData.adminTodo1.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.updatedAt).toBe(GraphData.adminTodo1.updatedAt);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: ContextData.alice,
    variables: { id: GraphData.adminTodo1.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.updatedAt).toBeNull();
});
