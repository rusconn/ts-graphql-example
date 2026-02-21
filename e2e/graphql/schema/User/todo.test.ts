import { db, dummyId, graph, tokens } from "../../../_shared/data.ts";
import { clearTables, seed } from "../../../_shared/helpers.ts";
import { executeSingleResultOperation } from "../../_shared/server.ts";
import type { UserTodoQuery, UserTodoQueryVariables } from "../_types.ts";

const executeQuery = executeSingleResultOperation<UserTodoQuery, UserTodoQueryVariables>(
  /* GraphQL */ `
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
  `,
);

const testData = {
  users: [db.users.admin, db.users.alice],
  todos: [db.todos.admin1, db.todos.alice1],
};

const seedData = {
  users: () => seed.users(testData.users),
  todos: () => seed.todos(testData.todos),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

test("not exists", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: {
      id: graph.users.admin.id,
      todoId: dummyId.todo(),
    },
  });

  if (data?.node?.__typename !== "User") {
    assert.fail();
  }

  expect(data.node.todo).toBeNull();
});

test("exists, owned", async () => {
  const { data } = await executeQuery({
    token: tokens.admin,
    variables: {
      id: graph.users.admin.id,
      todoId: graph.todos.admin1.id,
    },
  });

  if (data?.node?.__typename !== "User") {
    assert.fail();
  }

  expect(data.node.todo).not.toBeNull();
});

describe("exists, but not owned", () => {
  const patterns = [
    [tokens.admin, graph.users.admin.id, graph.todos.alice1.id],
    [tokens.alice, graph.users.alice.id, graph.todos.admin1.id],
  ] as const;

  test.each(patterns)("%o %s %s", async (token, id, todoId) => {
    const { data } = await executeQuery({
      token,
      variables: { id, todoId },
    });

    if (data?.node?.__typename !== "User") {
      assert.fail();
    }

    expect(data.node.todo).toBeNull();
  });
});
