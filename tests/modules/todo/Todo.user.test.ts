import type { TodoUserQuery, TodoUserQueryVariables } from "tests/modules/schema.ts";
import { ContextData, DBData, GraphData } from "tests/data/mod.ts";
import { clearTables, fail } from "tests/helpers.ts";
import { executeSingleResultOperation } from "tests/server.ts";
import { prisma } from "@/prisma/mod.ts";
import { ErrorCode } from "@/modules/common/schema.ts";

const executeQuery = executeSingleResultOperation<
  TodoUserQuery,
  TodoUserQueryVariables
>(/* GraphQL */ `
  query TodoUser($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        user {
          id
        }
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

  if (data?.node?.__typename !== "Todo" || data.node.user == null) {
    fail();
  }

  expect(data.node.user.id).toBe(GraphData.admin.id);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: ContextData.alice,
    variables: { id: GraphData.adminTodo1.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.user).toBeNull();
});
