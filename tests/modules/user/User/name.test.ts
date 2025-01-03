import { client } from "../../../../src/db/client.ts";

import { Data } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UserNameQuery, UserNameQueryVariables } from "../../schema.ts";

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

  expect(data.node.name).toBe(Data.graph.admin.name);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.name).toBeNull();
});
