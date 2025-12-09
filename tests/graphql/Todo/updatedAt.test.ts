import { db, graph, tokens } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoUpdatedAtQuery, TodoUpdatedAtQueryVariables } from "../schema.ts";

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
  users: [db.users.admin, db.users.alice],
  todos: [db.todos.admin1, db.todos.alice1],
};

const seedData = {
  users: () => seed.user(testData.users),
  todos: () => seed.todo(testData.todos),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

test("owned", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.todos.admin1.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.updatedAt).toBe(graph.todos.admin1.updatedAt);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.todos.admin1.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.updatedAt).toBeNull();
});
