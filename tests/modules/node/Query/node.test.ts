import { db } from "../../../../src/db/client.ts";

import { Data, dummyId } from "../../../data.ts";
import { clearTables } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { NodeQuery, NodeQueryVariables } from "../../schema.ts";

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
  users: () => db.insertInto("User").values(testData.users).execute(),
  todos: () => db.insertInto("Todo").values(testData.todos).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

test("not exists", async () => {
  const { data } = await executeQuery({
    variables: { id: dummyId.todo() },
  });

  expect(data?.node).toBeNull();
});

test("exists, but not owned", async () => {
  const { data } = await executeQuery({
    variables: { id: Data.graph.alice.id },
  });

  expect(data?.node).not.toBeNull();
});

describe("should return item correctly", () => {
  const ids = [Data.graph.admin.id, Data.graph.adminTodo.id];

  test.each(ids)("%s", async (id) => {
    const { data } = await executeQuery({
      variables: { id },
    });

    expect(data?.node?.id).toEqual(id);
  });
});
