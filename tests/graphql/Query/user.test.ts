import { Data, dummyId } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserQuery, UserQueryVariables } from "../schema.ts";

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
  users: () => seed.user(testData.users),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

it("should return item correctly", async () => {
  const { data } = await executeQuery({
    token: Data.token.admin,
    variables: { id: Data.graph.admin.id },
  });

  if (!data || !data.user) {
    fail();
  }

  expect(data.user.id).toEqual(Data.graph.admin.id);
});

it("should return null if not found", async () => {
  const { data } = await executeQuery({
    token: Data.token.admin,
    variables: { id: dummyId.user() },
  });

  expect(data?.user).toBeNull();
});
