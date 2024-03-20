import { db } from "@/db/mod.ts";
import {
  OrderDirection,
  type PageInfo,
  TodoOrderField,
  TodoStatus,
} from "@/modules/common/schema.ts";

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
    $status: TodoStatus
  ) {
    node(id: $id) {
      __typename
      ... on User {
        todos(
          first: $first
          after: $after
          last: $last
          before: $before
          orderBy: $orderBy
          status: $status
        ) {
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
  users: () => db.insertInto("User").values(testData.users).execute(),
  todos: () => db.insertInto("Todo").values(testData.todos).execute(),
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
      { orderBy: { field: TodoOrderField.CreatedAt, direction: OrderDirection.Desc } },
      [Data.graph.adminTodo3, Data.graph.adminTodo2, Data.graph.adminTodo],
    ],
    [
      { orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Asc } },
      [Data.graph.adminTodo2, Data.graph.adminTodo3, Data.graph.adminTodo],
    ],
    [
      { orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Desc } },
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

  describe("cursor", () => {
    const patterns = [
      [
        {
          id: Data.graph.admin.id,
          first: 2,
          orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Asc },
        },
        {
          length: 2,
          ids: [Data.graph.adminTodo2.id, Data.graph.adminTodo3.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.adminTodo2.id,
            endCursor: Data.db.adminTodo3.id,
          },
        },
        (pageInfo: PageInfo) => ({ after: pageInfo.endCursor }),
        {
          length: 1,
          ids: [Data.graph.adminTodo.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.adminTodo.id,
            endCursor: Data.db.adminTodo.id,
          },
        },
      ],
      [
        {
          id: Data.graph.admin.id,
          first: 2,
          orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Desc },
        },
        {
          length: 2,
          ids: [Data.graph.adminTodo.id, Data.graph.adminTodo3.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.adminTodo.id,
            endCursor: Data.db.adminTodo3.id,
          },
        },
        (pageInfo: PageInfo) => ({ after: pageInfo.endCursor }),
        {
          length: 1,
          ids: [Data.graph.adminTodo2.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.adminTodo2.id,
            endCursor: Data.db.adminTodo2.id,
          },
        },
      ],
      [
        {
          id: Data.graph.admin.id,
          last: 2,
          orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Asc },
        },
        {
          length: 2,
          ids: [Data.graph.adminTodo3.id, Data.graph.adminTodo.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.adminTodo3.id,
            endCursor: Data.db.adminTodo.id,
          },
        },
        (pageInfo: PageInfo) => ({ before: pageInfo.startCursor }),
        {
          length: 1,
          ids: [Data.graph.adminTodo2.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.adminTodo2.id,
            endCursor: Data.db.adminTodo2.id,
          },
        },
      ],
      [
        {
          id: Data.graph.admin.id,
          last: 2,
          orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Desc },
        },
        {
          length: 2,
          ids: [Data.graph.adminTodo3.id, Data.graph.adminTodo2.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.adminTodo3.id,
            endCursor: Data.db.adminTodo2.id,
          },
        },
        (pageInfo: PageInfo) => ({ before: pageInfo.startCursor }),
        {
          length: 1,
          ids: [Data.graph.adminTodo.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.adminTodo.id,
            endCursor: Data.db.adminTodo.id,
          },
        },
      ],
    ] as const;

    test.each(patterns)(
      "patterns %#",
      async (variables, firstExpect, additionals, secondExpect) => {
        const { data: data1 } = await executeQuery({
          variables,
        });

        if (!data1 || data1.node?.__typename !== "User" || !data1.node.todos) {
          fail();
        }

        expect(data1.node.todos.edges?.length).toBe(firstExpect.length);
        expect(data1.node.todos.pageInfo).toStrictEqual(firstExpect.pageInfo);
        expect(data1.node.todos.edges?.map(edge => edge?.node?.id)).toStrictEqual(firstExpect.ids);

        const { data: data2 } = await executeQuery({
          variables: {
            ...variables,
            ...additionals(data1.node.todos.pageInfo),
          },
        });

        if (!data2 || data2.node?.__typename !== "User" || !data2.node.todos) {
          fail();
        }

        expect(data2.node.todos.edges?.length).toBe(secondExpect.length);
        expect(data2.node.todos.pageInfo).toStrictEqual(secondExpect.pageInfo);
        expect(data2.node.todos.edges?.map(edge => edge?.node?.id)).toStrictEqual(secondExpect.ids);
      },
    );
  });
});

describe("filter by status", () => {
  const patterns = [
    [{}, [Data.graph.adminTodo, Data.graph.adminTodo3, Data.graph.adminTodo2]],
    [{ status: null }, [Data.graph.adminTodo, Data.graph.adminTodo3, Data.graph.adminTodo2]],
    [{ status: TodoStatus.Done }, [Data.graph.adminTodo2]],
    [{ status: TodoStatus.Pending }, [Data.graph.adminTodo, Data.graph.adminTodo3]],
  ] as const;

  test.each(patterns)("patterns %#", async (variables, expectedTodos) => {
    const { data } = await executeQuery({
      variables: { id: Data.graph.admin.id, first: 10, ...variables },
    });

    if (!data || data.node?.__typename !== "User" || !data.node.todos) {
      fail();
    }

    const expectedIds = expectedTodos.map(({ id }) => id);

    expect(data.node.todos.totalCount).toBe(expectedIds.length);
    expect(data.node.todos.edges?.map(edge => edge?.node?.id)).toStrictEqual(expectedIds);
  });
});
