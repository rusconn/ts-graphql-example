import {
  type PageInfo,
  type Todo,
  TodoSortKeys,
  TodoStatus,
  type UserTodosArgs,
} from "../../../src/schema.ts";

import { db, graph, tokens } from "../../data.ts";
import { clearTables, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserTodosQuery, UserTodosQueryVariables } from "../schema.ts";

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
    $reverse: Boolean
    $sortKey: TodoSortKeys
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
          reverse: $reverse
          sortKey: $sortKey
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
  users: [db.users.admin, db.users.alice],
  todos: [db.todos.admin1, db.todos.admin2, db.todos.admin3],
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

describe("number of items", () => {
  it("should affected by first option", async () => {
    const first = testData.todos.length - 1;

    const { data } = await executeQuery({
      token: tokens.admin,
      variables: { id: graph.users.admin.id, first },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todos?.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = testData.todos.length - 1;

    const { data } = await executeQuery({
      token: tokens.admin,
      variables: { id: graph.users.admin.id, last },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todos?.edges).toHaveLength(last);
  });
});

describe("order of items", () => {
  const patterns: [Partial<UserTodosArgs>, Todo[]][] = [
    [{}, [graph.todos.admin1, graph.todos.admin3, graph.todos.admin2]], // defaults to updatedAt desc
    [
      { reverse: false, sortKey: TodoSortKeys.CreatedAt },
      [graph.todos.admin1, graph.todos.admin2, graph.todos.admin3],
    ],
    [
      { reverse: true, sortKey: TodoSortKeys.CreatedAt },
      [graph.todos.admin3, graph.todos.admin2, graph.todos.admin1],
    ],
    [
      { reverse: false, sortKey: TodoSortKeys.UpdatedAt },
      [graph.todos.admin2, graph.todos.admin3, graph.todos.admin1],
    ],
    [
      { reverse: true, sortKey: TodoSortKeys.UpdatedAt },
      [graph.todos.admin1, graph.todos.admin3, graph.todos.admin2],
    ],
  ];

  test.each(patterns)("%o %o", async (variables, expectedTodos) => {
    const { data } = await executeQuery({
      token: tokens.admin,
      variables: { ...variables, id: graph.users.admin.id, first: 10 },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    const ids = data.node.todos?.edges?.map((edge) => edge?.node?.id);
    const expectedIds = expectedTodos.map(({ id }) => id);

    expect(ids).toStrictEqual(expectedIds);
  });
});

describe("pagination", () => {
  it("should not works by default", async () => {
    const first = testData.todos.length - 1;

    const execute = () =>
      executeQuery({
        token: tokens.admin,
        variables: { id: graph.users.admin.id, first },
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
    type Excpect = {
      length: number;
      ids: Todo["id"][];
      pageInfo: PageInfo;
    };

    type MakeCursor = (pageInfo: PageInfo) => Pick<UserTodosQueryVariables, "after" | "before">;

    const patterns: [UserTodosQueryVariables, Excpect, MakeCursor, Excpect][] = [
      [
        { id: graph.users.admin.id, first: 2, reverse: false, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          ids: [graph.todos.admin2.id, graph.todos.admin3.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.todos.admin2.id,
            endCursor: db.todos.admin3.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.endCursor != null && {
            after: pageInfo.endCursor,
          }),
        }),
        {
          length: 1,
          ids: [graph.todos.admin1.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.todos.admin1.id,
            endCursor: db.todos.admin1.id,
          },
        },
      ],
      [
        { id: graph.users.admin.id, first: 2, reverse: true, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          ids: [graph.todos.admin1.id, graph.todos.admin3.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.todos.admin1.id,
            endCursor: db.todos.admin3.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.endCursor != null && {
            after: pageInfo.endCursor,
          }),
        }),
        {
          length: 1,
          ids: [graph.todos.admin2.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.todos.admin2.id,
            endCursor: db.todos.admin2.id,
          },
        },
      ],
      [
        { id: graph.users.admin.id, last: 2, reverse: false, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          ids: [graph.todos.admin3.id, graph.todos.admin1.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.todos.admin3.id,
            endCursor: db.todos.admin1.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.startCursor != null && {
            before: pageInfo.startCursor,
          }),
        }),
        {
          length: 1,
          ids: [graph.todos.admin2.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.todos.admin2.id,
            endCursor: db.todos.admin2.id,
          },
        },
      ],
      [
        { id: graph.users.admin.id, last: 2, reverse: true, sortKey: TodoSortKeys.UpdatedAt },
        {
          length: 2,
          ids: [graph.todos.admin3.id, graph.todos.admin2.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.todos.admin3.id,
            endCursor: db.todos.admin2.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.startCursor != null && {
            before: pageInfo.startCursor,
          }),
        }),
        {
          length: 1,
          ids: [graph.todos.admin1.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.todos.admin1.id,
            endCursor: db.todos.admin1.id,
          },
        },
      ],
    ];

    test.each(patterns)("patterns %#", async (variables, firstExpect, makeCursor, secondExpect) => {
      const { data: data1 } = await executeQuery({
        token: tokens.admin,
        variables,
      });

      if (!data1 || data1.node?.__typename !== "User" || !data1.node.todos) {
        fail();
      }

      expect(data1.node.todos.edges?.length).toBe(firstExpect.length);
      expect(data1.node.todos.pageInfo).toStrictEqual(firstExpect.pageInfo);
      expect(data1.node.todos.edges?.map((edge) => edge?.node?.id)).toStrictEqual(firstExpect.ids);

      const { data: data2 } = await executeQuery({
        token: tokens.admin,
        variables: {
          ...variables,
          ...makeCursor(data1.node.todos.pageInfo),
        },
      });

      if (!data2 || data2.node?.__typename !== "User" || !data2.node.todos) {
        fail();
      }

      expect(data2.node.todos.edges?.length).toBe(secondExpect.length);
      expect(data2.node.todos.pageInfo).toStrictEqual(secondExpect.pageInfo);
      expect(data2.node.todos.edges?.map((edge) => edge?.node?.id)).toStrictEqual(secondExpect.ids);
    });
  });
});

describe("filter by status", () => {
  const patterns: [Partial<UserTodosArgs>, Todo[]][] = [
    [{}, [graph.todos.admin1, graph.todos.admin3, graph.todos.admin2]],
    [{ status: TodoStatus.Done }, [graph.todos.admin2]],
    [{ status: TodoStatus.Pending }, [graph.todos.admin1, graph.todos.admin3]],
  ];

  test.each(patterns)("patterns %#", async (variables, expectedTodos) => {
    const { data } = await executeQuery({
      token: tokens.admin,
      variables: { id: graph.users.admin.id, first: 10, ...variables },
    });

    if (!data || data.node?.__typename !== "User" || !data.node.todos) {
      fail();
    }

    const expectedIds = expectedTodos.map(({ id }) => id);

    expect(data.node.todos.totalCount).toBe(expectedIds.length);
    expect(data.node.todos.edges?.map((edge) => edge?.node?.id)).toStrictEqual(expectedIds);
  });
});
