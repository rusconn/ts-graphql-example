import { db, graph, tokens } from "../../../../data.ts";
import { clearTables, seed } from "../../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UserEmailQuery, UserEmailQueryVariables } from "../_types.ts";

const executeQuery = executeSingleResultOperation<UserEmailQuery, UserEmailQueryVariables>(
  /* GraphQL */ `
    query UserEmail($id: ID!) {
      node(id: $id) {
        __typename
        ... on User {
          email
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

  expect(data.node.email).toBe(graph.users.admin.email);
});

test("not owned, but admin", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.users.alice.id },
  });

  if (data?.node?.__typename !== "User") {
    assert.fail();
  }

  expect(data.node.email).toBe(graph.users.alice.email);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.users.admin.id },
  });

  expect(data?.node).toBeNull();
});
