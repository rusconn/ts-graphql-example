import { db } from "../../../../src/db/client.ts";

import { Data } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { TodoUpdatedAtQuery, TodoUpdatedAtQueryVariables } from "../../schema.ts";

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

test("owned", async () => {
  const { data } = await executeQuery({
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.updatedAt).toBe(Data.graph.adminTodo.updatedAt);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.updatedAt).toBeNull();
});
