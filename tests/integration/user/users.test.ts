import type { GraphQLFormattedError } from "graphql";
import range from "lodash/range";
import { gql } from "apollo-server";

import type { UsersQuery, UsersQueryVariables } from "it/types";
import { admin, alice, bob, guest } from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { getEnvsWithValidation, makeServer, toUserId, toUserNodeId } from "@/utils";
import { ErrorCode, User, OrderDirection, UserOrderField } from "@/types";

const envs = getEnvsWithValidation();
const server = makeServer({ ...envs, prisma });

const users = [admin, alice, bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const numSeed = users.length;

const query = gql`
  query Users($first: Int, $after: String, $last: Int, $before: String, $orderBy: UserOrder) {
    users(first: $first, last: $last, after: $after, before: $before, orderBy: $orderBy) {
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
`;

type ResponseType = {
  data?: UsersQuery | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables?: UsersQueryVariables;
};

/**
 * token のデフォルトは admin.token
 * @param params token の上書きや variables の指定に使う
 */
const executeQuery = (params?: ExecuteQueryParams) => {
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
});

describe("authorization", () => {
  const alloweds = [admin];
  const notAlloweds = [alice, bob, guest];

  test.each(alloweds)("allowed %s", async ({ token }) => {
    const { data, errors } = await executeQuery({ token });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %s", async ({ token }) => {
    const { data, errors } = await executeQuery({ token });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const firstMax = 30;
  const lastMax = 30;

  const valids = [
    {},
    { first: firstMax },
    { last: lastMax },
    { first: 1, after: toUserNodeId(admin.id) },
    { last: 1, before: toUserNodeId(bob.id) },
  ];

  const invalids = [
    { first: -1 },
    { first: 0 },
    { last: -1 },
    { last: 0 },
    { first: firstMax + 1 },
    { last: lastMax + 1 },
    { first: 1, last: 1 },
    { first: 1, before: toUserNodeId(admin.id) },
    { last: 1, after: toUserNodeId(bob.id) },
  ];

  test.each(valids)("valid %o", async variables => {
    const { data, errors } = await executeQuery({ variables });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
  });

  test.each(invalids)("invalid %o", async variables => {
    const { data, errors } = await executeQuery({ variables });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
  });
});

describe("number of items", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  it("should be 10 by default", async () => {
    const numDefault = 10;
    const numAdditionals = numDefault - numSeed + 1;
    const additionals = range(numAdditionals).map(x => ({ name: `${x}` }));
    await prisma.user.createMany({ data: additionals });

    const numUsers = await prisma.user.count();
    const { data } = await executeQuery();

    expect(numUsers).toBe(numDefault + 1);
    expect(data?.users.edges).toHaveLength(numDefault);
  });

  it("should affected by first option", async () => {
    const first = numSeed - 1;
    const { data } = await executeQuery({ variables: { first } });

    expect(data?.users.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = numSeed - 1;
    const { data } = await executeQuery({ variables: { last } });

    expect(data?.users.edges).toHaveLength(last);
  });
});

describe("order of items", () => {
  const patterns = [
    [{}, [bob, alice, admin]], // defaults to createdAt desc
    [
      { orderBy: { field: UserOrderField.CreatedAt, direction: OrderDirection.Asc } },
      [admin, alice, bob],
    ],
    [
      { orderBy: { field: UserOrderField.CreatedAt, direction: OrderDirection.Desc } },
      [bob, alice, admin],
    ],
    [
      { orderBy: { field: UserOrderField.UpdatedAt, direction: OrderDirection.Asc } },
      [alice, bob, admin],
    ],
    [
      { orderBy: { field: UserOrderField.UpdatedAt, direction: OrderDirection.Desc } },
      [admin, bob, alice],
    ],
  ] as const;

  test.each(patterns)("%o, %o", async (variables, expectedUsers) => {
    const { data } = await executeQuery({ variables });
    const ids = data?.users.edges.map(({ node }) => node.id).map(toUserId);
    const expectedIds = expectedUsers.map(({ id }) => id);

    expect(ids).toStrictEqual(expectedIds);
  });
});

describe("pagination", () => {
  it("should not works by default", async () => {
    const first = numSeed - 1;

    const makeExecution = () =>
      executeQuery({
        variables: {
          first,
          orderBy: { field: UserOrderField.CreatedAt, direction: OrderDirection.Asc },
        },
      });

    const { data: data1 } = await makeExecution();
    const { data: data2 } = await makeExecution();

    expect(data1?.users.edges).toHaveLength(first);
    expect(data2?.users.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });
});
