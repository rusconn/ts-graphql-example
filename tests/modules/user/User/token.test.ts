import { db } from "../../../../src/db/client.ts";
import { ErrorCode } from "../../../../src/schema.ts";

import { Data, dummyNodeId } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UserTokenQuery, UserTokenQueryVariables } from "../../schema.ts";

const executeQuery = executeSingleResultOperation<
  UserTokenQuery,
  UserTokenQueryVariables
>(/* GraphQL */ `
  query UserToken($id: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        token
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
    user: Data.context.admin,
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

  expect(data.node.token).toBe(Data.graph.admin.token);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: Data.context.alice,
    variables: { id: Data.graph.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.token).toBeNull();
});
