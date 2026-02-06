import { db, graph, tokens } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserNameQuery, UserNameQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<
  UserNameQuery,
  UserNameQueryVariables
>(/* GraphQL */ `
  query UserName($id: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        name
      }
    }
  }
`);

const testData = {
  users: [db.users.admin, db.users.alice],
};

const seedData = {
  users: () => seed.user(testData.users),
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

  expect(data.node.name).toBe(graph.users.admin.name);
});

test("not owned, but admin", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.users.alice.id },
  });

  if (data?.node?.__typename !== "User") {
    assert.fail();
  }

  expect(data.node.name).toBe(graph.users.alice.name);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.users.admin.id },
  });

  expect(data?.node).toBeNull();
});
