import { describe, test, expect, beforeAll } from "vitest";

import type { TodoDescriptionQuery, TodoDescriptionQueryVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearTables, fail } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation<
  TodoDescriptionQuery,
  TodoDescriptionQueryVariables
>(/* GraphQL */ `
  query TodoDescription($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        description
      }
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice],
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
  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.aliceTodo.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.adminTodo1.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("logic", () => {
  test("not exists", async () => {
    const { errors } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });

  test("exists, owned", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id },
    });

    if (data?.node?.__typename !== "Todo") {
      fail();
    }

    expect(data.node.description).toBe(GraphData.adminTodo1.description);
  });

  test("exists, but not owned", async () => {
    const { data } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.adminTodo1.id },
    });

    if (data?.node?.__typename !== "Todo") {
      fail();
    }

    expect(data.node.description).toBeNull();
  });
});
