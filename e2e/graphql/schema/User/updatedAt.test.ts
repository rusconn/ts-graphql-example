import { db, graph, tokens } from "../../../_shared/data.ts";
import { clearTables, seed } from "../../../_shared/helpers.ts";
import { executeSingleResultOperation } from "../../_shared/server.ts";
import type { UserUpdatedAtQuery, UserUpdatedAtQueryVariables } from "../_types.ts";

const executeQuery = executeSingleResultOperation<UserUpdatedAtQuery, UserUpdatedAtQueryVariables>(
  /* GraphQL */ `
    query UserUpdatedAt($id: ID!) {
      node(id: $id) {
        __typename
        ... on User {
          updatedAt
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

  expect(data.node.updatedAt).toBe(graph.users.admin.updatedAt?.toISOString());
});

test("not owned, but admin", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.users.alice.id },
  });

  if (data?.node?.__typename !== "User") {
    assert.fail();
  }

  expect(data.node.updatedAt).toBe(graph.users.alice.updatedAt?.toISOString());
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.users.admin.id },
  });

  expect(data?.node).toBeNull();
});
