import { db, graph, tokens } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserIdQuery, UserIdQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<UserIdQuery, UserIdQueryVariables>(/* GraphQL */ `
  query UserId($id: ID!) {
    node(id: $id) {
      __typename
      id
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
    fail();
  }

  expect(data.node.id).toBe(graph.users.admin.id);
});

test("not owned, but admin", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: graph.users.alice.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.id).toBe(graph.users.alice.id);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: tokens.alice,
    variables: { id: graph.users.admin.id },
  });

  expect(data?.node).toBeNull();
});
