import { db, dummyId, graph, tokens } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
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
  users: [db.users.admin],
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
    token: tokens.admin,
    variables: { id: graph.users.admin.id },
  });

  if (!data || !data.user) {
    assert.fail();
  }

  expect(data.user.id).toBe(graph.users.admin.id);
});

it("should return null if not found", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: { id: dummyId.user() },
  });

  expect(data?.user).toBeNull();
});
