import { client } from "../../../../src/db/client.ts";
import { type PageInfo, UserSortKeys } from "../../../../src/schema.ts";

import { Data } from "../../../data.ts";
import { clearUsers, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UsersQuery, UsersQueryVariables } from "../../schema.ts";

const executeQuery = executeSingleResultOperation<UsersQuery, UsersQueryVariables>(/* GraphQL */ `
  query Users(
    $first: Int
    $after: String
    $last: Int
    $before: String
    $reverse: Boolean
    $sortKey: UserSortKeys
  ) {
    users(
      first: $first
      last: $last
      after: $after
      before: $before
      reverse: $reverse
      sortKey: $sortKey
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
        }
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
};

const seedData = {
  users: () => client.insertInto("User").values(testData.users).execute(),
};

beforeAll(async () => {
  await clearUsers();
  await seedData.users();
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
    [{}, [Data.graph.alice, Data.graph.admin]], // defaults to createdAt desc
    [{ reverse: false, sortKey: UserSortKeys.CreatedAt }, [Data.graph.admin, Data.graph.alice]],
    [{ reverse: true, sortKey: UserSortKeys.CreatedAt }, [Data.graph.alice, Data.graph.admin]],
    [{ reverse: false, sortKey: UserSortKeys.UpdatedAt }, [Data.graph.alice, Data.graph.admin]],
    [{ reverse: true, sortKey: UserSortKeys.UpdatedAt }, [Data.graph.admin, Data.graph.alice]],
  ] as const;

  test.each(patterns)("%o, %o", async (variables, expectedUsers) => {
    const { data } = await executeQuery({
      variables: { ...variables, first: 10 },
    });

    const ids = data?.users?.edges?.map((edge) => edge?.node?.id);
    const expectedIds = expectedUsers.map(({ id }) => id);

    expect(ids).toStrictEqual(expectedIds);
  });
});

describe("pagination", () => {
  it("should not works by default", async () => {
    const first = testData.users.length - 1;

    const execute = () =>
      executeQuery({
        variables: { first },
      });

    const { data: data1 } = await execute();
    const { data: data2 } = await execute();

    expect(data1?.users?.edges).toHaveLength(first);
    expect(data2?.users?.edges).toHaveLength(first);
    expect(data1).toStrictEqual(data2);
  });

  describe("cursor", () => {
    const patterns = [
      [
        { first: 1, reverse: false, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          ids: [Data.graph.admin.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.admin.id,
            endCursor: Data.db.admin.id,
          },
        },
        (pageInfo: PageInfo) => ({ after: pageInfo.endCursor }),
        {
          length: 1,
          ids: [Data.graph.alice.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.alice.id,
            endCursor: Data.db.alice.id,
          },
        },
      ],
      [
        { first: 1, reverse: true, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          ids: [Data.graph.alice.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.alice.id,
            endCursor: Data.db.alice.id,
          },
        },
        (pageInfo: PageInfo) => ({ after: pageInfo.endCursor }),
        {
          length: 1,
          ids: [Data.graph.admin.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.admin.id,
            endCursor: Data.db.admin.id,
          },
        },
      ],
      [
        { last: 1, reverse: false, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          ids: [Data.graph.alice.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.alice.id,
            endCursor: Data.db.alice.id,
          },
        },
        (pageInfo: PageInfo) => ({ before: pageInfo.startCursor }),
        {
          length: 1,
          ids: [Data.graph.admin.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.admin.id,
            endCursor: Data.db.admin.id,
          },
        },
      ],
      [
        { last: 1, reverse: true, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          ids: [Data.graph.admin.id],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: Data.db.admin.id,
            endCursor: Data.db.admin.id,
          },
        },
        (pageInfo: PageInfo) => ({ before: pageInfo.startCursor }),
        {
          length: 1,
          ids: [Data.graph.alice.id],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: Data.db.alice.id,
            endCursor: Data.db.alice.id,
          },
        },
      ],
    ] as const;

    test.each(patterns)(
      "patterns %#",
      async (variables, firstExpect, additionals, secondExpect) => {
        const { data: data1 } = await executeQuery({
          variables,
        });

        if (!data1 || !data1.users) {
          fail();
        }

        expect(data1.users.edges?.length).toBe(firstExpect.length);
        expect(data1.users.pageInfo).toStrictEqual(firstExpect.pageInfo);
        expect(data1.users.edges?.map((edge) => edge?.node?.id)).toStrictEqual(firstExpect.ids);

        const { data: data2 } = await executeQuery({
          variables: {
            ...variables,
            ...additionals(data1.users.pageInfo),
          },
        });

        if (!data2 || !data2.users) {
          fail();
        }

        expect(data2.users.edges?.length).toBe(secondExpect.length);
        expect(data2.users.pageInfo).toStrictEqual(secondExpect.pageInfo);
        expect(data2.users.edges?.map((edge) => edge?.node?.id)).toStrictEqual(secondExpect.ids);
      },
    );
  });
});
