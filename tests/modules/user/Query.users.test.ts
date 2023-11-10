import { describe, test, it, expect, beforeAll } from "vitest";

import type { UsersQuery, UsersQueryVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearUsers } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation<UsersQuery, UsersQueryVariables>(/* GraphQL */ `
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
`);

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
  test("not AuthorizationError -> not Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.admin,
      variables: { first: 1 },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.alice,
      variables: { first: 1 },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  test("not ParseError -> not BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: { first: 10 },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: {},
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
