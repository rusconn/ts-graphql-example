import type { TodoNodeQuery, TodoNodeQueryVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearTables } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation<
  TodoNodeQuery,
  TodoNodeQueryVariables
>(/* GraphQL */ `
  query TodoNode(
    $id: ID!
    $includeTitle: Boolean = false
    $includeDescription: Boolean = false
    $includeStatus: Boolean = false
  ) {
    node(id: $id) {
      __typename
      id
      ... on Todo {
        createdAt
        updatedAt
        title @include(if: $includeTitle)
        description @include(if: $includeDescription)
        status @include(if: $includeStatus)
        user {
          id
        }
      }
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
  todos: [DBData.adminTodo1, DBData.aliceTodo],
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

describe("authorization", () => {
  const allow = [
    [ContextData.admin, GraphData.adminTodo1.id, { includeTitle: true }],
    [ContextData.admin, GraphData.adminTodo1.id, { includeDescription: true }],
    [ContextData.admin, GraphData.adminTodo1.id, { includeStatus: true }],
    [ContextData.alice, GraphData.aliceTodo.id, { includeTitle: true }],
    [ContextData.alice, GraphData.aliceTodo.id, { includeDescription: true }],
    [ContextData.alice, GraphData.aliceTodo.id, { includeStatus: true }],
    [ContextData.admin, GraphData.aliceTodo.id, {}],
  ] as const;

  const deny = [
    [ContextData.alice, GraphData.adminTodo1.id, {}],
    [ContextData.guest, GraphData.adminTodo1.id, {}],
    [ContextData.guest, GraphData.aliceTodo.id, {}],
    [ContextData.admin, GraphData.aliceTodo.id, { includeTitle: true }],
    [ContextData.admin, GraphData.aliceTodo.id, { includeDescription: true }],
    [ContextData.admin, GraphData.aliceTodo.id, { includeStatus: true }],
  ] as const;

  test.each(allow)("allowed %o %s %o", async (user, id, options) => {
    const { errors } = await executeQuery({
      user,
      variables: { id, ...options },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(deny)("not allowed %o %s %o", async (user, id, options) => {
    const { errors } = await executeQuery({
      user,
      variables: { id, ...options },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("logic", () => {
  test("not exists", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });

  test("exists, owned", async () => {
    const { data } = await executeQuery({
      variables: {
        id: GraphData.adminTodo1.id,
        includeTitle: true,
        includeDescription: true,
        includeStatus: true,
      },
    });

    if (data?.node?.__typename !== "Todo") {
      fail();
    }

    expect(data.node.id).toBe(GraphData.adminTodo1.id);
    expect(data.node.createdAt).toEqual(GraphData.adminTodo1.createdAt);
    expect(data.node.updatedAt).toEqual(GraphData.adminTodo1.updatedAt);
    expect(data.node.title).toBe(GraphData.adminTodo1.title);
    expect(data.node.description).toBe(GraphData.adminTodo1.description);
    expect(data.node.status).toBe(GraphData.adminTodo1.status);
    expect(data.node.user?.id).toBe(GraphData.admin.id);
  });

  test("exists, but not owned", async () => {
    const { data } = await executeQuery({
      variables: {
        id: GraphData.aliceTodo.id,
        includeTitle: true,
        includeDescription: true,
        includeStatus: true,
      },
    });

    if (data?.node?.__typename !== "Todo") {
      fail();
    }

    expect(data.node.id).toBe(GraphData.aliceTodo.id);
    expect(data.node.createdAt).toEqual(GraphData.aliceTodo.createdAt);
    expect(data.node.updatedAt).toEqual(GraphData.aliceTodo.updatedAt);
    expect(data.node.title).toBeNull();
    expect(data.node.description).toBeNull();
    expect(data.node.status).toBeNull();
    expect(data.node.user?.id).toBe(GraphData.alice.id);
  });
});
