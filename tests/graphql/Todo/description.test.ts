import { db, graph, tokens } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoDescriptionQuery, TodoDescriptionQueryVariables } from "../_schema.ts";

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
  users: [db.users.admin, db.users.alice],
  todos: [db.todos.admin1, db.todos.alice1],
};

const seedData = {
  users: () => seed.users(testData.users),
  todos: () => seed.todos(testData.todos),
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
    assert.fail();
  }

  expect(data.node.description).toBe(graph.todos.admin1.description);
});

test("not owned, but admin", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.todos.alice1.id },
  });

  if (data?.node?.__typename !== "Todo") {
    assert.fail();
  }

  expect(data.node.description).toBeNull();
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.todos.admin1.id },
  });

  expect(data?.node).toBeNull();
});
