import { ErrorCode } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { ContextData, DBData, GraphData } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { UserTokenQuery, UserTokenQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

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
  users: [DBData.admin, DBData.alice],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

test("not exists", async () => {
  const { errors } = await executeQuery({
    user: ContextData.admin,
    variables: { id: GraphData.admin.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  // 他人のリソースと見做されるので Forbidden
  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    variables: { id: GraphData.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.token).toBe(GraphData.admin.token);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: ContextData.alice,
    variables: { id: GraphData.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.token).toBeNull();
});
