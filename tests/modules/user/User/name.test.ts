import { ErrorCode } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { ContextData, DBData, GraphData } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { UserNameQuery, UserNameQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

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
    variables: { id: GraphData.admin.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    variables: { id: GraphData.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.name).toBe(GraphData.admin.name);
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    user: ContextData.alice,
    variables: { id: GraphData.admin.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.name).toBeNull();
});