import { Data } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserEmailQuery, UserEmailQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<
  UserEmailQuery,
  UserEmailQueryVariables
>(/* GraphQL */ `
  query UserEmail($id: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        email
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

  expect(data.node.email).toBe(Data.graph.admin.email);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: Data.token.alice,
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.email).toBeNull();
});
