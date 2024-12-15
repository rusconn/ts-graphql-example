import { db } from "../../../../src/db/client.ts";
import { ErrorCode } from "../../../../src/schema.ts";

import { Data, dummyNodeId } from "../../../data.ts";
import { clearTables, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UserTodoQuery, UserTodoQueryVariables } from "../../schema.ts";

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
        }
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
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
    variables: {
      id: Data.graph.admin.id,
      todoId: dummyNodeId.todo(),
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
      id: Data.graph.admin.id,
      todoId: Data.graph.adminTodo.id,
    },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.todo).not.toBeNull();
});

describe("exists, but not owned", () => {
  const patterns = [
    [Data.context.admin, Data.graph.admin.id, Data.graph.aliceTodo.id],
    [Data.context.alice, Data.graph.alice.id, Data.graph.adminTodo.id],
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
