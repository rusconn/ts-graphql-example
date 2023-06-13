import type { GraphQLFormattedError } from "graphql";
import range from "lodash/range";
import { gql } from "apollo-server";

import type { TodosQuery, TodosQueryVariables } from "it/types";
import { admin, adminTodo1, adminTodo2, adminTodo3, alice, bob, guest } from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { getEnvsWithValidation, makeServer, todoId } from "@/utils";
import { ErrorCode, User, OrderDirection, TodoOrderField } from "@/types";

const envs = getEnvsWithValidation();
const server = makeServer({ ...envs, prisma });

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedAdminTodos = () => prisma.todo.createMany({ data: todos });

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

type ResponseType = {
  data?: TodosQuery | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables?: TodosQueryVariables;
};

/**
 * token のデフォルトは admin.token
 * @param params token の上書きや variables の指定に使う
 */
const executeQuery = (params: ExecuteQueryParams) => {
  const token = params && "token" in params ? params.token : admin.token;
  const variables = params?.variables;

  return server.executeOperation(
    { query, variables },
    makeContext({ query, token })
  ) as Promise<ResponseType>;
};

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedAdminTodos();
});

describe("authorization", () => {
  const allowedPatterns = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const notAllowedPatterns = [
    [alice, admin],
    [alice, bob],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allowedPatterns)("allowed %s", async ({ token }, { id }) => {
    const { data, errors } = await executeQuery({ token, variables: { userId: id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %s", async ({ token }, { id }) => {
    const { data, errors } = await executeQuery({ token, variables: { userId: id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const firstMax = 50;
  const lastMax = 50;

  const valids = [
    {},
    { first: firstMax },
    { last: lastMax },
    { first: 1, after: adminTodo1.id },
    { last: 1, before: adminTodo2.id },
  ];

  const invalids = [
    { first: -1 },
    { first: 0 },
    { last: -1 },
    { last: 0 },
    { first: firstMax + 1 },
    { last: lastMax + 1 },
    { first: 1, last: 1 },
    { first: 1, before: adminTodo1.id },
    { last: 1, after: adminTodo2.id },
  ];

  test.each(valids)("valid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables: { ...variables, userId: admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
  });

  test.each(invalids)("invalid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables: { ...variables, userId: admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todos).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
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
      id: todoId(),
      title: `${x}`,
      userId: admin.id,
    }));
    await prisma.todo.createMany({ data: additionals });

    const numTodos = await prisma.todo.count();
    const { data } = await executeQuery({ variables: { userId: admin.id } });

    expect(numTodos).toBe(numDefault + 1);
    expect(data?.todos?.edges).toHaveLength(numDefault);
  });

  it("should affected by first option", async () => {
    const first = numSeedTodos - 1;
    const { data } = await executeQuery({ variables: { first, userId: admin.id } });

    expect(data?.todos?.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = numSeedTodos - 1;
    const { data } = await executeQuery({ variables: { last, userId: admin.id } });

    expect(data?.todos?.edges).toHaveLength(last);
  });
});

describe("order of items", () => {
  const patterns = [
    [{}, [adminTodo1, adminTodo3, adminTodo2]], // defaults to updatedAt desc
    [
      { orderBy: { field: TodoOrderField.CreatedAt, direction: OrderDirection.Asc } },
      [adminTodo1, adminTodo2, adminTodo3],
    ],
    [
      { orderBy: { field: TodoOrderField.CreatedAt, direction: OrderDirection.Desc } },
      [adminTodo3, adminTodo2, adminTodo1],
    ],
    [
      { orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Asc } },
      [adminTodo2, adminTodo3, adminTodo1],
    ],
    [
      { orderBy: { field: TodoOrderField.UpdatedAt, direction: OrderDirection.Desc } },
      [adminTodo1, adminTodo3, adminTodo2],
    ],
  ] as const;

  test.each(patterns)("%o, %o", async (variables, expectedTodos) => {
    const { data } = await executeQuery({
      variables: { ...variables, userId: admin.id },
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
          userId: admin.id,
        },
      });

    const { data: data1 } = await makeExecution();
    const { data: data2 } = await makeExecution();

    expect(data1?.todos?.edges).toHaveLength(first);
    expect(data2?.todos?.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });
});
