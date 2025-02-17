import { Data, dummyId } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { NodeQuery, NodeQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<NodeQuery, NodeQueryVariables>(/* GraphQL */ `
  query Node($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo],
};

const seedData = {
  users: () => seed.user(testData.users),
  todos: () => seed.todo(testData.todos),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

test("not exists", async () => {
  const { data } = await executeQuery({
    token: Data.token.admin,
    variables: { id: dummyId.todo() },
  });

  expect(data?.node).toBeNull();
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    token: Data.token.admin,
    variables: { id: Data.graph.alice.id },
  });

  expect(data?.node).not.toBeNull();
});

describe("should return item correctly", () => {
  const ids = [Data.graph.admin.id, Data.graph.adminTodo.id];

  test.each(ids)("%s", async (id) => {
    const { data } = await executeQuery({
      token: Data.token.admin,
      variables: { id },
    });

    expect(data?.node?.id).toEqual(id);
  });
});
