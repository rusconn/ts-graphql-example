import { ErrorCode } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { Data } from "tests/data.ts";
import { clearTables } from "tests/helpers.ts";
import type { NodeQuery, NodeQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

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
  users: () => prisma.user.createMany({ data: testData.users }),
  todos: () => prisma.todo.createMany({ data: testData.todos }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

test("not exists", async () => {
  const { data, errors } = await executeQuery({
    variables: { id: Data.graph.admin.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(data?.node).toBeNull();
  expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
});

test("exists, but not owned", async () => {
  const { data, errors } = await executeQuery({
    variables: { id: Data.graph.alice.id },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(data?.node).not.toBeNull();
  expect(errorCodes).toEqual(expect.not.arrayContaining([ErrorCode.NotFound]));
});

describe("should return item correctly", () => {
  const ids = [Data.graph.admin.id, Data.graph.adminTodo.id];

  test.each(ids)("%s", async id => {
    const { data } = await executeQuery({
      variables: { id },
    });

    expect(data?.node?.id).toEqual(id);
  });
});

describe("should return not found error if not found", () => {
  const ids = [Data.graph.admin.id, Data.graph.adminTodo.id].map(id => id.slice(0, -1));

  test.each(ids)("%s", async id => {
    const { data, errors } = await executeQuery({
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
  });
});
