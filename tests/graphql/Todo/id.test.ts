import { client } from "../../../src/db/client.ts";

import { Data } from "../../data.ts";
import { clearTables, fail } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoIdQuery, TodoIdQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<TodoIdQuery, TodoIdQueryVariables>(/* GraphQL */ `
  query TodoId($id: ID!) {
    node(id: $id) {
      __typename
      id
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
};

const seedData = {
  users: () => client.insertInto("User").values(testData.users).execute(),
  todos: () => client.insertInto("Todo").values(testData.todos).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

test("owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.admin,
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.id).toBe(Data.graph.adminTodo.id);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.node).toBeNull();
});
