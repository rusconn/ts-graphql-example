import { db } from "../../../../src/db/client.ts";

import { Data } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { TodoStatusQuery, TodoStatusQueryVariables } from "../../schema.ts";

const executeQuery = executeSingleResultOperation<
  TodoStatusQuery,
  TodoStatusQueryVariables
>(/* GraphQL */ `
  query TodoStatus($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        status
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

  expect(data.node.status).toBe(Data.graph.adminTodo.status);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.status).toBeNull();
});
