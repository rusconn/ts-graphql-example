import { Data } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TodoUserQuery, TodoUserQueryVariables } from "../schema.ts";

const executeQuery = executeSingleResultOperation<
  TodoUserQuery,
  TodoUserQueryVariables
>(/* GraphQL */ `
  query TodoUser($id: ID!) {
    node(id: $id) {
      __typename
      ... on Todo {
        user {
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

test("owned", async () => {
  const { data } = await executeQuery({
    token: Data.token.admin,
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo" || data.node.user == null) {
    fail();
  }

  expect(data.node.user.id).toBe(Data.graph.admin.id);
});

test("not owned", async () => {
  const { data } = await executeQuery({
    token: Data.token.alice,
    variables: { id: Data.graph.adminTodo.id },
  });

  if (data?.node?.__typename !== "Todo") {
    fail();
  }

  expect(data.node.user).toBeNull();
});
