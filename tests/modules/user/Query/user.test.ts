import { db } from "@/db/client.ts";
import { ErrorCode } from "@/modules/common/schema.ts";

import { Data } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { UserQuery, UserQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeQuery = executeSingleResultOperation<UserQuery, UserQueryVariables>(/* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) {
      id
    }
  }
`);

const testData = {
  users: [Data.db.admin],
};

const seedData = {
  users: () => db.insertInto("User").values(testData.users).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

it("should return item correctly", async () => {
  const { data } = await executeQuery({
    variables: { id: Data.graph.admin.id },
  });

  if (!data || !data.user) {
    fail();
  }

  expect(data.user.id).toEqual(Data.graph.admin.id);
});

it("should return not found error if not found", async () => {
  const { data, errors } = await executeQuery({
    variables: { id: Data.graph.admin.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(data?.user).toBeNull();
  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});
