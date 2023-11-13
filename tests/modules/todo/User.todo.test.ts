import { describe, test, it, expect, beforeAll } from "vitest";

import type { UserTodoQuery, UserTodoQueryVariables } from "tests/modules/schema.js";
import { ContextData, DBData, GraphData } from "tests/data/mod.js";
import { clearTables, fail } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import * as Graph from "@/modules/common/schema.js";

const executeQuery = executeSingleResultOperation<
  UserTodoQuery,
  UserTodoQueryVariables
>(/* GraphQL */ `
  query UserTodo($id: ID!, $todoId: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        todo(id: $todoId) {
          id
          user {
            id
          }
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
  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.alice.id, todoId: GraphData.aliceTodo.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.admin.id, todoId: GraphData.adminTodo1.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeQuery({
      variables: { id: GraphData.admin.id, todoId: GraphData.validTodoIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { errors } = await executeQuery({
      variables: { id: GraphData.admin.id, todoId: GraphData.invalidTodoIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

describe("logic", () => {
  test("not exists", async () => {
    const { data } = await executeQuery({
      variables: {
        id: GraphData.admin.id,
        todoId: GraphData.adminTodo1.id.slice(0, -1),
      },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo).toBeNull();
  });

  test("exists, owned", async () => {
    const { data } = await executeQuery({
      variables: {
        id: GraphData.admin.id,
        todoId: GraphData.adminTodo1.id,
      },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo).not.toBeNull();
  });

  describe("exists, but not owned", () => {
    const patterns = [
      [ContextData.admin, GraphData.admin.id, GraphData.aliceTodo.id],
      [ContextData.alice, GraphData.alice.id, GraphData.adminTodo1.id],
    ] as const;

    test.each(patterns)("%o %s %s", async (user, id, todoId) => {
      const { data, errors } = await executeQuery({
        user,
        variables: { id, todoId },
      });

      if (data?.node?.__typename !== "User") {
        fail();
      }

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data.node.todo).toBeNull();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
    });
  });

  it("should set correct parent user id", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.admin.id, todoId: GraphData.adminTodo1.id },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo?.user?.id).toBe(GraphData.admin.id);
  });
});
