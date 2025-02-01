import { Data, dummyId } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserTodoQuery, UserTodoQueryVariables } from "../schema.ts";

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
    variables: {
      id: Data.graph.admin.id,
      todoId: dummyId.todo(),
    },
  });

  if (data?.node?.__typename !== "User") {
    fail();
  }

  expect(data.node.todo).toBeNull();
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    token: Data.token.admin,
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
    [Data.token.admin, Data.graph.admin.id, Data.graph.aliceTodo.id],
    [Data.token.alice, Data.graph.alice.id, Data.graph.adminTodo.id],
  ] as const;

  test.each(patterns)("%o %s %s", async (token, id, todoId) => {
    const { data } = await executeQuery({
      token,
      variables: { id, todoId },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo).toBeNull();
  });
});
