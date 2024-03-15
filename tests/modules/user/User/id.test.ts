import { ErrorCode } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { Data } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { UserIdQuery, UserIdQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

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
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

test("not exists", async () => {
  const { data, errors } = await executeQuery({
    variables: { id: Data.graph.admin.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(data?.node).toBeNull();
  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
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
