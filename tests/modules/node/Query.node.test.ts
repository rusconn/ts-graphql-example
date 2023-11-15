import type { NodeQuery, NodeQueryVariables } from "tests/modules/schema.js";
import { DBData, GraphData } from "tests/data/mod.js";
import { clearTables } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import * as Graph from "@/modules/common/schema.js";

const executeQuery = executeSingleResultOperation<NodeQuery, NodeQueryVariables>(/* GraphQL */ `
  query Node($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
  todos: [
    DBData.adminTodo1,
    DBData.adminTodo2,
    DBData.adminTodo3,
    DBData.aliceTodo,
    DBData.bobTodo,
  ],
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
    variables: { id: GraphData.admin.id.slice(0, -1) },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(data?.node).toBeNull();
  expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
});

test("exists, but not owned", async () => {
  const { data, errors } = await executeQuery({
    variables: { id: GraphData.alice.id },
  });

  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(data?.node).not.toBeNull();
  expect(errorCodes).toEqual(expect.not.arrayContaining([Graph.ErrorCode.NotFound]));
});

describe("should return item correctly", () => {
  const ids = [GraphData.admin.id, GraphData.adminTodo1.id];

  test.each(ids)("%s", async id => {
    const { data } = await executeQuery({
      variables: { id },
    });

    expect(data?.node?.id).toEqual(id);
  });
});

describe("should return not found error if not found", () => {
  const ids = [GraphData.admin.id, GraphData.adminTodo1.id].map(id => id.slice(0, -1));

  test.each(ids)("%s", async id => {
    const { data, errors } = await executeQuery({
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });
});
