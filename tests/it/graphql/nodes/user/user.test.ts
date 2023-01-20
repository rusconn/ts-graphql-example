import { gql } from "graphql-tag";
import range from "lodash/range";

import type { UserQuery, UserQueryVariables } from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { todoAPI, userAPI } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];
const todos = [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3];

const seedUsers = () => userAPI.createMany(users);
const seedAdminTodos = () => todoAPI.createMany(todos);

const numSeedTodos = todos.length;

const query = gql`
  query User(
    $id: ID!
    $includeToken: Boolean = false
    $includeTodos: Boolean = false
    $first: Int
    $after: String
    $last: Int
    $before: String
    $orderBy: TodoOrder
  ) {
    user(id: $id) {
      id
      createdAt
      updatedAt
      name
      token @include(if: $includeToken)
      todos(first: $first, after: $after, last: $last, before: $before, orderBy: $orderBy)
        @include(if: $includeTodos) {
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
            title
            status
          }
        }
      }
    }
  }
`;

const executeQuery = executeSingleResultOperation(query)<UserQuery, UserQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedAdminTodos();
});

describe("authorization", () => {
  describe("query user", () => {
    const allowedPatterns = [
      [ContextData.admin, GraphData.admin],
      [ContextData.admin, GraphData.alice],
    ] as const;

    const notAllowedPatterns = [
      [ContextData.alice, GraphData.admin],
      [ContextData.alice, GraphData.alice],
      [ContextData.alice, GraphData.bob],
      [ContextData.guest, GraphData.admin],
      [ContextData.guest, GraphData.alice],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });
  });

  describe("query subfields", () => {
    const allowedPatterns = [[ContextData.admin, GraphData.admin, { includeToken: true }]] as const;

    const notAllowedPatterns = [
      [ContextData.admin, GraphData.alice, { includeToken: true }],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async (user, { id }, options) => {
      const { data, errors } = await executeQuery({
        user,
        variables: { id, ...options },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async (user, { id }, options) => {
      const { data, errors } = await executeQuery({
        user,
        variables: { id, ...options },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(data?.user?.token).toBeNull();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(GraphData.validUserIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });

  describe("todos arguments", () => {
    const firstMax = 50;
    const lastMax = 50;

    const valids = [{}, { first: firstMax }, { last: lastMax }];
    const invalids = [{ first: firstMax + 1 }, { last: lastMax + 1 }];

    test.each(valids)("valid %o", async variables => {
      const { data, errors } = await executeQuery({
        variables: { ...variables, id: GraphData.admin.id, includeTodos: true },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %o", async variables => {
      const { data, errors } = await executeQuery({
        variables: { ...variables, id: GraphData.admin.id, includeTodos: true },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("query without other nodes", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.admin.id, includeToken: true },
    });

    expect(data?.user).toEqual(GraphData.admin);
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.admin.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });
});

describe("query other nodes: todos", () => {
  describe("number of items", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedAdminTodos();
    });

    it("should be 20 by default", async () => {
      const numDefault = 20;
      const numAdditionals = numDefault - numSeedTodos + 1;

      const additionals = range(numAdditionals).map(x => ({
        title: `${x}`,
        description: "",
        userId: DBData.admin.id,
      }));

      const creates = additionals.map(additional => todoAPI.create(additional));

      await Promise.all(creates);

      const { data } = await executeQuery({
        variables: { id: GraphData.admin.id, includeTodos: true },
      });

      const numTodos = await todoAPI.count();

      expect(numTodos).toBe(numDefault + 1);
      expect(data?.user?.todos?.edges).toHaveLength(numDefault);
    });

    it("should affected by first option", async () => {
      const first = numSeedTodos - 1;

      const { data } = await executeQuery({
        variables: { id: GraphData.admin.id, includeTodos: true, first },
      });

      expect(data?.user?.todos?.edges).toHaveLength(first);
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
        variables: { ...variables, id: GraphData.admin.id, includeTodos: true },
      });

      const ids = data?.user?.todos?.edges.map(({ node }) => node.id);
      const expectedIds = expectedTodos.map(({ id }) => id);

      expect(ids).toStrictEqual(expectedIds);
    });
  });

  describe("pagination", () => {
    it("should not works by default", async () => {
      const first = numSeedTodos - 1;

      const makeExecution = () =>
        executeQuery({ variables: { id: GraphData.admin.id, includeTodos: true, first } });

      const { data: data1 } = await makeExecution();
      const { data: data2 } = await makeExecution();

      expect(data1?.user?.todos?.edges).toHaveLength(first);
      expect(data2?.user?.todos?.edges).toHaveLength(first);
      expect(data1).toStrictEqual(data2);
    });
  });
});
