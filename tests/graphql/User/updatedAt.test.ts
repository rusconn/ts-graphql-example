import { Data } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserUpdatedAtQuery, UserUpdatedAtQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<
  UserUpdatedAtQuery,
  UserUpdatedAtQueryVariables
>(/* GraphQL */ `
  query UserUpdatedAt($id: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        updatedAt
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
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
    token: Data.token.admin,
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.updatedAt).toBe(Data.graph.admin.updatedAt);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: Data.token.alice,
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.updatedAt).toBeNull();
});
