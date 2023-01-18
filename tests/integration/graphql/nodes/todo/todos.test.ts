import { gql } from "graphql-tag";
import range from "lodash/range";

import { OrderDirection, TodoOrderField, TodosQuery, TodosQueryVariables } from "it/graphql/types";
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
  query Todos(
    $userId: ID!
    $first: Int
    $after: String
    $last: Int
    $before: String
    $orderBy: TodoOrder
  ) {
    todos(
      userId: $userId
      first: $first
      last: $last
      after: $after
      before: $before
      orderBy: $orderBy
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
          title
        }
      }
    }
  }
`;

const executeQuery = executeSingleResultOperation(query)<TodosQuery, TodosQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedAdminTodos();
});

describe("authorization", () => {
  const allowedPatterns = [
    [ContextData.admin, GraphData.admin],
    [ContextData.admin, GraphData.alice],
    [ContextData.alice, GraphData.alice],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.alice, GraphData.admin],
    [ContextData.alice, GraphData.bob],
    [ContextData.guest, GraphData.admin],
    [ContextData.guest, GraphData.alice],
  ] as const;

  test.each(allowedPatterns)("allowed %s", async (user, { id }) => {
    const { data, errors } = await executeQuery({ user, variables: { userId: id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %s", async (user, { id }) => {
    const { data, errors } = await executeQuery({ user, variables: { userId: id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const firstMax = 50;
  const lastMax = 50;

  const valids = [
    {},
    { first: firstMax },
    { last: lastMax },
    { first: 1, after: GraphData.adminTodo1.id },
    { last: 1, before: GraphData.adminTodo2.id },
  ];

  const invalids = [
    { first: -1 },
    { first: 0 },
    { last: -1 },
    { last: 0 },
    { first: firstMax + 1 },
    { last: lastMax + 1 },
    { first: 1, last: 1 },
    { first: 1, before: GraphData.adminTodo1.id },
    { last: 1, after: GraphData.adminTodo2.id },
  ];

  test.each(valids)("valid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables: { ...variables, userId: GraphData.admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test.each(invalids)("invalid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables: { ...variables, userId: GraphData.admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

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

    const numTodos = await todoAPI.count();
    const { data } = await executeQuery({ variables: { userId: GraphData.admin.id } });

    expect(numTodos).toBe(numDefault + 1);
    expect(data?.todos?.edges).toHaveLength(numDefault);
  });

  it("should affected by first option", async () => {
    const first = numSeedTodos - 1;
    const { data } = await executeQuery({ variables: { first, userId: GraphData.admin.id } });

    expect(data?.todos?.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = numSeedTodos - 1;
    const { data } = await executeQuery({ variables: { last, userId: GraphData.admin.id } });

    expect(data?.todos?.edges).toHaveLength(last);
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
      { orderBy: { field: Graph.TodoOrderField.CreatedAt, direction: Graph.OrderDirection.Desc } },
      [GraphData.adminTodo3, GraphData.adminTodo2, GraphData.adminTodo1],
    ],
    [
      { orderBy: { field: Graph.TodoOrderField.UpdatedAt, direction: Graph.OrderDirection.Asc } },
      [GraphData.adminTodo2, GraphData.adminTodo3, GraphData.adminTodo1],
    ],
    [
      { orderBy: { field: Graph.TodoOrderField.UpdatedAt, direction: Graph.OrderDirection.Desc } },
      [GraphData.adminTodo1, GraphData.adminTodo3, GraphData.adminTodo2],
    ],
  ] as const;

  test.each(patterns)("%o, %o", async (variables, expectedTodos) => {
    const { data } = await executeQuery({
      variables: { ...variables, userId: GraphData.admin.id },
    });

    const ids = data?.todos?.edges.map(({ node }) => node.id);
    const expectedIds = expectedTodos.map(({ id }) => id);

    expect(ids).toStrictEqual(expectedIds);
  });
});

describe("pagination", () => {
  it("should not works by default", async () => {
    const first = numSeedTodos - 1;

    const makeExecution = () =>
      executeQuery({
        variables: {
          first,
          orderBy: { field: TodoOrderField.CreatedAt, direction: OrderDirection.Asc },
          userId: GraphData.admin.id,
        },
      });

    const { data: data1 } = await makeExecution();
    const { data: data2 } = await makeExecution();

    expect(data1?.todos?.edges).toHaveLength(first);
    expect(data2?.todos?.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });
});
