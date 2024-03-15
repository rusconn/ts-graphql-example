import { OrderDirection, TodoOrderField } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { Data } from "tests/data.ts";
import { clearTables, fail } from "tests/helpers.ts";
import type { UserTodosQuery, UserTodosQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeQuery = executeSingleResultOperation<
  UserTodosQuery,
  UserTodosQueryVariables
>(/* GraphQL */ `
  query UserTodos(
    $id: ID!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $orderBy: TodoOrder
  ) {
    node(id: $id) {
      __typename
      ... on User {
        todos(first: $first, after: $after, last: $last, before: $before, orderBy: $orderBy) {
          totalCount
          pageInfo {
            startCursor
            endCursor
            hasNextPage
            hasPreviousPage
          }
          edges {
            cursor
            node {
              id
            }
          }
        }
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.adminTodo2, Data.db.adminTodo3],
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

describe("number of items", () => {
  it("should affected by first option", async () => {
    const first = testData.todos.length - 1;

    const { data } = await executeQuery({
      variables: { id: Data.graph.admin.id, first },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todos?.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = testData.todos.length - 1;

    const { data } = await executeQuery({
      variables: { id: Data.graph.admin.id, last },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todos?.edges).toHaveLength(last);
  });
});

describe("order of items", () => {
  const patterns = [
    [{}, [Data.graph.adminTodo, Data.graph.adminTodo3, Data.graph.adminTodo2]], // defaults to updatedAt desc
    [
      { orderBy: { field: TodoOrderField.CreatedAt, direction: OrderDirection.Asc } },
      [Data.graph.adminTodo, Data.graph.adminTodo2, Data.graph.adminTodo3],
    ],
    [
      {
        orderBy: { field: TodoOrderField.CreatedAt, direction: OrderDirection.Desc },
      },
      [Data.graph.adminTodo3, Data.graph.adminTodo2, Data.graph.adminTodo],
    ],
    [
      { orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Asc } },
      [Data.graph.adminTodo2, Data.graph.adminTodo3, Data.graph.adminTodo],
    ],
    [
      {
        orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Desc },
      },
      [Data.graph.adminTodo, Data.graph.adminTodo3, Data.graph.adminTodo2],
    ],
  ] as const;

  test.each(patterns)("%o %o", async (variables, expectedTodos) => {
    const { data } = await executeQuery({
      variables: { ...variables, id: Data.graph.admin.id, first: 10 },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    const ids = data.node.todos?.edges?.map(edge => edge?.node?.id);
    const expectedIds = expectedTodos.map(({ id }) => id);

    expect(ids).toStrictEqual(expectedIds);
  });
});

describe("pagination", () => {
  it("should not works by default", async () => {
    const first = testData.todos.length - 1;

    const execute = () =>
      executeQuery({
        variables: { id: Data.graph.admin.id, first },
      });

    const { data: data1 } = await execute();
    const { data: data2 } = await execute();

    if (data1?.node?.__typename !== "User") {
      fail();
    }

    if (data2?.node?.__typename !== "User") {
      fail();
    }

    expect(data1.node.todos?.edges).toHaveLength(first);
    expect(data2.node.todos?.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });
});
