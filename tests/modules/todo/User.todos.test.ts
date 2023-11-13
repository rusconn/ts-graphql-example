import type { UserTodosQuery, UserTodosQueryVariables } from "tests/modules/schema.js";
import { ContextData, DBData, GraphData } from "tests/data/mod.js";
import { clearTables, fail } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import * as Graph from "@/modules/common/schema.js";

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
  users: [DBData.admin, DBData.alice, DBData.bob],
  todos: [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3],
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
      variables: { id: GraphData.alice.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  test("not ParseError -> not BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.admin.id, first: 10 },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node.todos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.admin.id },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).not.toBeFalsy();
    expect(data?.node.todos).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

describe("logic", () => {
  describe("number of items", () => {
    it("should affected by first option", async () => {
      const first = testData.todos.length - 1;

      const { data } = await executeQuery({
        variables: { id: GraphData.admin.id, first },
      });

      if (data?.node?.__typename !== "User") {
        fail();
      }

      expect(data.node.todos?.edges).toHaveLength(first);
    });

    it("should affected by last option", async () => {
      const last = testData.todos.length - 1;

      const { data } = await executeQuery({
        variables: { id: GraphData.admin.id, last },
      });

      if (data?.node?.__typename !== "User") {
        fail();
      }

      expect(data.node.todos?.edges).toHaveLength(last);
    });
  });

  describe("order of items", () => {
    const patterns = [
      [{}, [GraphData.adminTodo1, GraphData.adminTodo3, GraphData.adminTodo2]], // defaults to updatedAt desc
      [
        { orderBy: { field: Graph.TodoOrderField.CreatedAt, direction: Graph.OrderDirection.Asc } },
        [GraphData.adminTodo1, GraphData.adminTodo2, GraphData.adminTodo3],
      ],
      [
        {
          orderBy: { field: Graph.TodoOrderField.CreatedAt, direction: Graph.OrderDirection.Desc },
        },
        [GraphData.adminTodo3, GraphData.adminTodo2, GraphData.adminTodo1],
      ],
      [
        { orderBy: { field: Graph.TodoOrderField.UpdatedAt, direction: Graph.OrderDirection.Asc } },
        [GraphData.adminTodo2, GraphData.adminTodo3, GraphData.adminTodo1],
      ],
      [
        {
          orderBy: { field: Graph.TodoOrderField.UpdatedAt, direction: Graph.OrderDirection.Desc },
        },
        [GraphData.adminTodo1, GraphData.adminTodo3, GraphData.adminTodo2],
      ],
    ] as const;

    test.each(patterns)("%o %o", async (variables, expectedTodos) => {
      const { data } = await executeQuery({
        variables: { ...variables, id: GraphData.admin.id, first: 10 },
      });

      if (data?.node?.__typename !== "User") {
        fail();
      }

      const ids = data.node.todos?.edges.map(({ node }) => node.id);
      const expectedIds = expectedTodos.map(({ id }) => id);

      expect(ids).toStrictEqual(expectedIds);
    });
  });

  describe("pagination", () => {
    it("should not works by default", async () => {
      const first = testData.todos.length - 1;

      const execute = () =>
        executeQuery({
          variables: { id: GraphData.admin.id, first },
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
});
