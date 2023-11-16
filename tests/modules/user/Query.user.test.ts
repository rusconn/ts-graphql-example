import type { UserQuery, UserQueryVariables } from "tests/modules/schema.js";
import { DBData, GraphData } from "tests/data/mod.js";
import { clearTables, fail } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import { ErrorCode } from "@/modules/common/schema.js";

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
