import { client } from "../../../src/db/client.ts";

import { Data } from "../../data.ts";
import { clearTables, fail } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserCreatedAtQuery, UserCreatedAtQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<
  UserCreatedAtQuery,
  UserCreatedAtQueryVariables
>(/* GraphQL */ `
  query UserCreatedAt($id: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        createdAt
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
};

const seedData = {
  users: () => client.insertInto("User").values(testData.users).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

test("owned", async () => {
  const { data } = await executeQuery({
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.createdAt).toBe(Data.graph.admin.createdAt);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.createdAt).toBeNull();
});
