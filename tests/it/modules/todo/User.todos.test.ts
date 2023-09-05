import type { UesrTodosQuery, UesrTodosQueryVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as Graph from "@/modules/common/schema";

const users = [DBData.admin, DBData.alice, DBData.bob];
const todos = [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedAdminTodos = () => prisma.todo.createMany({ data: todos });

const numSeedTodos = todos.length;

const query = /* GraphQL */ `
  query UesrTodos(
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
`;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedAdminTodos();
});

const executeQuery = executeSingleResultOperation(query)<UesrTodosQuery, UesrTodosQueryVariables>;

describe("authorization", () => {
  const allowedPatterns = [
    [ContextData.admin, GraphData.admin.id],
    [ContextData.alice, GraphData.alice.id],
    [ContextData.admin, GraphData.alice.id],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.alice, GraphData.admin.id],
    [ContextData.guest, GraphData.admin.id],
    [ContextData.guest, GraphData.alice.id],
  ] as const;

  test.each(allowedPatterns)("allowed %o %s", async (user, id) => {
    const { errors } = await executeQuery({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %s", async (user, id) => {
    const { errors } = await executeQuery({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const firstMax = 50;
  const lastMax = 50;

  const valids = [{ first: firstMax }, { last: lastMax }];
  const invalids = [{}, { first: firstMax + 1 }, { last: lastMax + 1 }];

  test.each(valids)("valid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables: { ...variables, id: GraphData.admin.id },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node.todos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test.each(invalids)("invalid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables: { ...variables, id: GraphData.admin.id },
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
      const first = numSeedTodos - 1;

      const { data } = await executeQuery({
        variables: { id: GraphData.admin.id, first },
      });

      if (data?.node?.__typename !== "User") {
        fail();
      }

      expect(data.node.todos?.edges).toHaveLength(first);
    });

    it("should affected by last option", async () => {
      const last = numSeedTodos - 1;

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
      const first = numSeedTodos - 1;

      const makeExecution = () =>
        executeQuery({
          variables: { id: GraphData.admin.id, first },
        });

      const { data: data1 } = await makeExecution();
      const { data: data2 } = await makeExecution();

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
