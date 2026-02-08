import { db, graph, tokens } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoStatusQuery, TodoStatusQueryVariables } from "../_schema.ts";

const executeQuery = executeSingleResultOperation<TodoStatusQuery, TodoStatusQueryVariables>(
  /* GraphQL */ `
    query TodoStatus($id: ID!) {
      node(id: $id) {
        __typename
        ... on Todo {
          status
        }
      }
    }
  `,
);

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

  expect(data.node.status).toBe(graph.todos.admin1.status);
});

test("not owned, but admin", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.todos.alice1.id },
  });

  if (data?.node?.__typename !== "Todo") {
    assert.fail();
  }

  expect(data.node.status).toBeNull();
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.todos.admin1.id },
  });

  expect(data?.node).toBeNull();
});
