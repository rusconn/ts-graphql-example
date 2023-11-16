import type { UserQuery, UserQueryVariables } from "tests/modules/schema.ts";
import { DBData, GraphData } from "tests/data/mod.ts";
import { clearTables, fail } from "tests/helpers.ts";
import { executeSingleResultOperation } from "tests/server.ts";
import { prisma } from "@/prisma/mod.ts";
import { ErrorCode } from "@/modules/common/schema.ts";

const executeQuery = executeSingleResultOperation<UserQuery, UserQueryVariables>(/* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) {
      id
    }
  }
`);

const testData = {
  users: [DBData.admin],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

it("should return item correctly", async () => {
  const { data } = await executeQuery({
    variables: { id: GraphData.admin.id },
  });

  if (!data || !data.user) {
    fail();
  }

  expect(data.user.id).toEqual(GraphData.admin.id);
});

it("should return not found error if not found", async () => {
  const { data, errors } = await executeQuery({
    variables: { id: GraphData.admin.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(data?.user).toBeNull();
  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});
