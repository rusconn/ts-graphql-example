import type { UsersQuery, UsersQueryVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { clearUsers } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation(/* GraphQL */ `
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
`)<UsersQuery, UsersQueryVariables>;

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearUsers();
  await seedData.users();
});

describe("authorization", () => {
  const alloweds = [ContextData.admin];
  const notAlloweds = [ContextData.alice, ContextData.bob, ContextData.guest];

  test.each(alloweds)("allowed %s", async user => {
    const { data, errors } = await executeQuery({
      user,
      variables: { first: 1 },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %s", async user => {
    const { data, errors } = await executeQuery({
      user,
      variables: { first: 1 },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const firstMax = 30;
  const lastMax = 30;

  const valids = [{ first: firstMax }, { last: lastMax }];
  const invalids = [{}, { first: firstMax + 1 }, { last: lastMax + 1 }];

  test.each(valids)("valid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test.each(invalids)("invalid %o", async variables => {
    const { data, errors } = await executeQuery({
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

describe("number of items", () => {
  it("should affected by first option", async () => {
    const first = testData.users.length - 1;

    const { data } = await executeQuery({
      variables: { first },
    });

    expect(data?.users?.edges).toHaveLength(first);
  });

  it("should affected by last option", async () => {
    const last = testData.users.length - 1;

    const { data } = await executeQuery({
      variables: { last },
    });

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
    const { data } = await executeQuery({
      variables: { ...variables, first: 10 },
    });

    const ids = data?.users?.edges.map(({ node }) => node.id);
    const expectedIds = expectedUsers.map(({ id }) => id);

    expect(ids).toStrictEqual(expectedIds);
  });
});

describe("pagination", () => {
  it("should not works by default", async () => {
    const first = testData.users.length - 1;

    const execute = () =>
      executeQuery({
        variables: {
          first,
          orderBy: { field: Graph.UserOrderField.CreatedAt, direction: Graph.OrderDirection.Asc },
        },
      });

    const { data: data1 } = await execute();
    const { data: data2 } = await execute();

    expect(data1?.users?.edges).toHaveLength(first);
    expect(data2?.users?.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });
});
