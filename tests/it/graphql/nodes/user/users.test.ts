import { gql } from "graphql-tag";
import range from "lodash/range";
import { nanoid } from "nanoid";

import type { UsersQuery, UsersQueryVariables } from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];

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

const executeQuery = executeSingleResultOperation(query)<UsersQuery, UsersQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  const alloweds = [ContextData.admin];
  const notAlloweds = [ContextData.alice, ContextData.bob, ContextData.guest];

  test.each(alloweds)("allowed %s", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %s", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const firstMax = 30;
  const lastMax = 30;

  const valids = [{}, { first: firstMax }, { last: lastMax }];
  const invalids = [{ first: firstMax + 1 }, { last: lastMax + 1 }];

  test.each(valids)("valid %o", async variables => {
    const { data, errors } = await executeQuery({ variables });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test.each(invalids)("invalid %o", async variables => {
    const { data, errors } = await executeQuery({ variables });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
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

    const additionals = range(numAdditionals).map(x => ({
      id: nanoid(),
      name: `${x}`,
      email: `email${x}@email.com`,
      password: "password",
      token: `${x}`,
    }));

    const creates = additionals.map(additional => prisma.user.create({ data: additional }));

    await Promise.all(creates);

    const numUsers = await prisma.user.count();
    const { data } = await executeQuery({});

    expect(numUsers).toBe(numDefault + 1);
    expect(data?.users?.edges).toHaveLength(numDefault);
  });

  it("should affected by first option", async () => {
    const first = numSeed - 1;
    const { data } = await executeQuery({ variables: { first } });

    expect(data?.users?.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = numSeed - 1;
    const { data } = await executeQuery({ variables: { last } });

    expect(data?.users?.edges).toHaveLength(last);
  });
});

describe("order of items", () => {
  const patterns = [
    [{}, [GraphData.bob, GraphData.alice, GraphData.admin]], // defaults to createdAt desc
    [
      { orderBy: { field: Graph.UserOrderField.CreatedAt, direction: Graph.OrderDirection.Asc } },
      [GraphData.admin, GraphData.alice, GraphData.bob],
    ],
    [
      { orderBy: { field: Graph.UserOrderField.CreatedAt, direction: Graph.OrderDirection.Desc } },
      [GraphData.bob, GraphData.alice, GraphData.admin],
    ],
    [
      { orderBy: { field: Graph.UserOrderField.UpdatedAt, direction: Graph.OrderDirection.Asc } },
      [GraphData.alice, GraphData.bob, GraphData.admin],
    ],
    [
      { orderBy: { field: Graph.UserOrderField.UpdatedAt, direction: Graph.OrderDirection.Desc } },
      [GraphData.admin, GraphData.bob, GraphData.alice],
    ],
  ] as const;

  test.each(patterns)("%o, %o", async (variables, expectedUsers) => {
    const { data } = await executeQuery({ variables });
    const ids = data?.users?.edges.map(({ node }) => node.id);
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
          orderBy: { field: Graph.UserOrderField.CreatedAt, direction: Graph.OrderDirection.Asc },
        },
      });

    const { data: data1 } = await makeExecution();
    const { data: data2 } = await makeExecution();

    expect(data1?.users?.edges).toHaveLength(first);
    expect(data2?.users?.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });
});
