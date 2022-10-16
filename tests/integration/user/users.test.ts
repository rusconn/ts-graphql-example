import { gql } from "graphql-tag";
import range from "lodash/range";

import type { UsersQuery, UsersQueryVariables } from "it/types";
import { defaultContext } from "it/context";
import { admin, alice, bob, guest } from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { userId } from "@/utils";
import { ErrorCode, OrderDirection, UserOrderField, Context } from "@/types";

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

type ExecuteQueryParams = {
  user?: Context["user"];
  variables?: UsersQueryVariables;
};

/**
 * user のデフォルトは admin
 * @param params user の上書きや variables の指定に使う
 */
const executeQuery = async (params: ExecuteQueryParams) => {
  const user = params.user ?? admin;
  const { variables } = params;

  const res = await server.executeOperation<UsersQuery>(
    { query, variables },
    { contextValue: { ...defaultContext, user } }
  );

  if (res.body.kind !== "single") {
    throw new Error("not single");
  }

  return res.body.singleResult;
};

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  const alloweds = [admin];
  const notAlloweds = [alice, bob, guest];

  test.each(alloweds)("allowed %s", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.users).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %s", async user => {
    const { data, errors } = await executeQuery({ user });
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
    { first: 1, after: admin.id },
    { last: 1, before: bob.id },
  ];

  const invalids = [
    { first: -1 },
    { first: 0 },
    { last: -1 },
    { last: 0 },
    { first: firstMax + 1 },
    { last: lastMax + 1 },
    { first: 1, last: 1 },
    { first: 1, before: admin.id },
    { last: 1, after: bob.id },
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
    const additionals = range(numAdditionals).map(x => ({
      id: userId(),
      name: `${x}`,
    }));
    await prisma.user.createMany({ data: additionals });

    const numUsers = await prisma.user.count();
    const { data } = await executeQuery({});

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
    const ids = data?.users.edges.map(({ node }) => node.id);
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
