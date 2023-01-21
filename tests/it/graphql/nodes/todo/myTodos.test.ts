import { gql } from "graphql-tag";
import range from "lodash/range";

import {
  OrderDirection,
  TodoOrderField,
  MyTodosQuery,
  MyTodosQueryVariables,
} from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { todoAPI, userAPI } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];
const todos = [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3];

const seedUsers = () => userAPI.createManyForTest(users);
const seedAdminTodos = () => todoAPI.createManyForTest(todos);

const numSeedTodos = todos.length;

const query = gql`
  query MyTodos($first: Int, $after: String, $last: Int, $before: String, $orderBy: TodoOrder) {
    myTodos(first: $first, last: $last, after: $after, before: $before, orderBy: $orderBy) {
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

const executeQuery = executeSingleResultOperation(query)<MyTodosQuery, MyTodosQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedAdminTodos();
});

describe("authorization", () => {
  const alloweds = [ContextData.admin, ContextData.alice] as const;
  const notAlloweds = [ContextData.guest] as const;

  test.each(alloweds)("allowed %s", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.myTodos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %s", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.myTodos).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const firstMax = 50;
  const lastMax = 50;

  const valids = [{}, { first: firstMax }, { last: lastMax }];
  const invalids = [{ first: firstMax + 1 }, { last: lastMax + 1 }];

  test.each(valids)("valid %o", async variables => {
    const { data, errors } = await executeQuery({ variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.myTodos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test.each(invalids)("invalid %o", async variables => {
    const { data, errors } = await executeQuery({ variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.myTodos).toBeFalsy();
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
    const { data } = await executeQuery({});

    expect(numTodos).toBe(numDefault + 1);
    expect(data?.myTodos?.edges).toHaveLength(numDefault);
  });

  it("should affected by first option", async () => {
    const first = numSeedTodos - 1;
    const { data } = await executeQuery({ variables: { first } });

    expect(data?.myTodos?.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = numSeedTodos - 1;
    const { data } = await executeQuery({ variables: { last } });

    expect(data?.myTodos?.edges).toHaveLength(last);
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
    const { data } = await executeQuery({ variables });

    const ids = data?.myTodos?.edges.map(({ node }) => node.id);
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
        },
      });

    const { data: data1 } = await makeExecution();
    const { data: data2 } = await makeExecution();

    expect(data1?.myTodos?.edges).toHaveLength(first);
    expect(data2?.myTodos?.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });
});
