import { db, graph, tokens } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserCreatedAtQuery, UserCreatedAtQueryVariables } from "../_schema.ts";

const executeQuery = executeSingleResultOperation<UserCreatedAtQuery, UserCreatedAtQueryVariables>(
  /* GraphQL */ `
    query UserCreatedAt($id: ID!) {
      node(id: $id) {
        __typename
        ... on User {
          createdAt
        }
      }
    }
  `,
);

const testData = {
  users: [db.users.admin, db.users.alice],
};

const seedData = {
  users: () => seed.users(testData.users),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

test("owned", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.users.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    assert.fail();
  }

  expect(data.node.createdAt).toBe(graph.users.admin.createdAt?.toISOString());
});

test("not owned, but admin", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.users.alice.id },
  });

  if (data?.node?.__typename !== "User") {
    assert.fail();
  }

  expect(data.node.createdAt).toBe(graph.users.alice.createdAt?.toISOString());
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.users.admin.id },
  });

  expect(data?.node).toBeNull();
});
