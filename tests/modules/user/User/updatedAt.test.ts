import { db } from "../../../../src/db/client.ts";
import { ErrorCode } from "../../../../src/schema.ts";

import { Data, dummyNodeId } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UserUpdatedAtQuery, UserUpdatedAtQueryVariables } from "../../schema.ts";

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
  users: () => db.insertInto("User").values(testData.users).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

test("not exists", async () => {
  const { errors } = await executeQuery({
    variables: { id: dummyNodeId.user() },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.updatedAt).toBe(Data.graph.admin.updatedAt);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.updatedAt).toBeNull();
});
