import { db } from "../../../../src/db/client.ts";
import { ErrorCode } from "../../../../src/modules/common/schema.ts";

import { Data } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { TodoCreatedAtQuery, TodoCreatedAtQueryVariables } from "../../schema.ts";

const executeQuery = executeSingleResultOperation<
  TodoCreatedAtQuery,
  TodoCreatedAtQueryVariables
>(/* GraphQL */ `
  query TodoCreatedAt($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        createdAt
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
};

const seedData = {
  users: () => db.insertInto("User").values(testData.users).execute(),
  todos: () => db.insertInto("Todo").values(testData.todos).execute(),
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

  expect(data.node.createdAt).toBe(Data.graph.adminTodo.createdAt);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.createdAt).toBeNull();
});
