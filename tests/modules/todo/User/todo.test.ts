import type { UserTodoQuery, UserTodoQueryVariables } from "tests/modules/schema.ts";
import { ContextData, DBData, GraphData } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import { executeSingleResultOperation } from "tests/server.ts";
import { prisma } from "@/prisma/mod.ts";
import { ErrorCode } from "@/modules/common/schema.ts";

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
  users: [DBData.admin, DBData.alice],
  todos: [DBData.adminTodo, DBData.aliceTodo],
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
  const { data } = await executeQuery({
    variables: {
      id: GraphData.admin.id,
      todoId: GraphData.adminTodo.id.slice(0, -1),
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
      todoId: GraphData.adminTodo.id,
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
    [ContextData.alice, GraphData.alice.id, GraphData.adminTodo.id],
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
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
  });
});

it("should set correct parent user id", async () => {
  const { data } = await executeQuery({
    variables: { id: GraphData.admin.id, todoId: GraphData.adminTodo.id },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.todo?.user?.id).toBe(GraphData.admin.id);
});
