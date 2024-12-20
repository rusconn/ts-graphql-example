import { db } from "../../../../src/db/client.ts";

import { Data, dummyNodeId } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UserIdQuery, UserIdQueryVariables } from "../../schema.ts";

const executeQuery = executeSingleResultOperation<UserIdQuery, UserIdQueryVariables>(/* GraphQL */ `
  query UserId($id: ID!) {
    node(id: $id) {
      __typename
      id
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
};

const seedData = {
  users: () => db.insertInto("User").values(testData.users).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

test("not exists", async () => {
  const { data } = await executeQuery({
    variables: { id: dummyNodeId.user() },
  });

  expect(data?.node).toBeNull();
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.id).toBe(Data.graph.admin.id);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.admin.id },
  });

  expect(data?.node).toBeNull();
});
