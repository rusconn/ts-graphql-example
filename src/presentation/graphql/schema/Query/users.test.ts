import { GraphQLError } from "graphql";
import type { ControlledTransaction } from "kysely";

import type * as Dto from "../../../../application/dto.ts";
import type { DB } from "../../../../infrastructure/datasources/_shared/generated.ts";
import { kysely } from "../../../../infrastructure/datasources/db/client.ts";
import { createSeeders, type Seeders } from "../../../_shared/test/helpers/helpers.ts";
import { type ContextForIT, context } from "../_test/data/context/dynamic.ts";
import { db, domain, dto } from "../_test/data.ts";
import { createContext } from "../_test/helpers.ts";
import { ErrorCode, type PageInfo, type QueryUsersArgs, UserSortKeys } from "../_types.ts";
import { FIRST_MAX, resolver } from "./users.ts";

let trx: ControlledTransaction<DB>;
let seeders: Seeders;

beforeAll(async () => {
  trx = await kysely.startTransaction().execute();
  seeders = createSeeders(trx);
  await seeders.users(domain.users.alice, domain.users.admin);
});

afterAll(async () => {
  await trx.rollback().execute();
});

const users = async (
  ctx: ContextForIT, //
  args: QueryUsersArgs,
) => {
  return await resolver({}, args, createContext(ctx, trx));
};

describe("authorization", () => {
  const args: QueryUsersArgs = {
    reverse: true,
    sortKey: UserSortKeys.CreatedAt,
  };

  it("rejects when user is not admin", async () => {
    const ctx = context.alice();

    await expect(users(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.Forbidden,
    );
  });

  it("not rejects when user is admin", async () => {
    const ctx = context.admin();

    try {
      await users(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.Forbidden);
    }
  });
});

describe("parsing", () => {
  it("throws an input error when args are invalid", async () => {
    const ctx = context.admin();
    const args: QueryUsersArgs = {
      first: FIRST_MAX + 1,
      reverse: true,
      sortKey: UserSortKeys.CreatedAt,
    };

    await expect(users(ctx, args)).rejects.toSatisfy(
      (e) =>
        e instanceof GraphQLError && //
        e.extensions.code === ErrorCode.BadUserInput,
    );
  });

  it("not throws input errors when args are valid", async () => {
    const ctx = context.admin();
    const args: QueryUsersArgs = {
      first: FIRST_MAX,
      reverse: true,
      sortKey: UserSortKeys.CreatedAt,
    };

    try {
      await users(ctx, args);
    } catch (e) {
      if (!(e instanceof GraphQLError)) throw e;
      expect(e.extensions.code).not.toBe(ErrorCode.BadUserInput);
    }
  });
});

describe("number of items", () => {
  const ctx = context.admin();

  it("affected by first option", async () => {
    const args: QueryUsersArgs = {
      reverse: true,
      sortKey: UserSortKeys.CreatedAt,
    };

    const result1 = await users(ctx, { ...args, first: 1 });
    expect(result1?.nodes).toHaveLength(1);

    const result2 = await users(ctx, { ...args, first: 2 });
    expect(result2?.nodes).toHaveLength(2);
  });

  it("affected by last option", async () => {
    const args: QueryUsersArgs = {
      reverse: true,
      sortKey: UserSortKeys.CreatedAt,
    };

    const result1 = await users(ctx, { ...args, last: 1 });
    expect(result1?.nodes).toHaveLength(1);

    const result2 = await users(ctx, { ...args, last: 2 });
    expect(result2?.nodes).toHaveLength(2);
  });
});

describe("order of items", () => {
  const ctx = context.admin();

  const patterns: [QueryUsersArgs, [Dto.User.Type, Dto.User.Type]][] = [
    [
      { reverse: false, sortKey: UserSortKeys.CreatedAt, first: FIRST_MAX },
      [dto.users.admin, dto.users.alice],
    ],
    [
      { reverse: true, sortKey: UserSortKeys.CreatedAt, first: FIRST_MAX },
      [dto.users.alice, dto.users.admin],
    ],
    [
      { reverse: false, sortKey: UserSortKeys.UpdatedAt, first: FIRST_MAX },
      [dto.users.alice, dto.users.admin],
    ],
    [
      { reverse: true, sortKey: UserSortKeys.UpdatedAt, first: FIRST_MAX },
      [dto.users.admin, dto.users.alice],
    ],
  ];

  it.each(patterns)("returns users in correct order: %#", async (args, expectedUsers) => {
    const result = await users(ctx, args);
    assert(result?.nodes);
    expect(result?.nodes).toStrictEqual(expectedUsers);
  });
});

describe("pagination", () => {
  const ctx = context.admin();

  it("should not works by default", async () => {
    const args: QueryUsersArgs = {
      first: 1,
      reverse: true,
      sortKey: UserSortKeys.CreatedAt,
    };

    const result1 = await users(ctx, args);
    const result2 = await users(ctx, args);

    expect(result1?.nodes).toHaveLength(1);
    expect(result2?.nodes).toHaveLength(1);
    expect(result1).toStrictEqual(result2);
  });

  describe("cursor", () => {
    type Excpect = {
      length: number;
      users: Dto.User.Type[];
      pageInfo: PageInfo;
    };

    type MakeCursor = (pageInfo: PageInfo) => Pick<QueryUsersArgs, "after" | "before">;

    const patterns: [QueryUsersArgs, Excpect, MakeCursor, Excpect][] = [
      [
        { first: 1, reverse: false, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          users: [dto.users.admin],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.users.admin.id,
            endCursor: db.users.admin.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.endCursor != null && {
            after: pageInfo.endCursor,
          }),
        }),
        {
          length: 1,
          users: [dto.users.alice],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.users.alice.id,
            endCursor: db.users.alice.id,
          },
        },
      ],
      [
        { first: 1, reverse: true, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          users: [dto.users.alice],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.users.alice.id,
            endCursor: db.users.alice.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.endCursor != null && {
            after: pageInfo.endCursor,
          }),
        }),
        {
          length: 1,
          users: [dto.users.admin],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.users.admin.id,
            endCursor: db.users.admin.id,
          },
        },
      ],
      [
        { last: 1, reverse: false, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          users: [dto.users.alice],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.users.alice.id,
            endCursor: db.users.alice.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.startCursor != null && {
            before: pageInfo.startCursor,
          }),
        }),
        {
          length: 1,
          users: [dto.users.admin],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.users.admin.id,
            endCursor: db.users.admin.id,
          },
        },
      ],
      [
        { last: 1, reverse: true, sortKey: UserSortKeys.CreatedAt },
        {
          length: 1,
          users: [dto.users.admin],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: true,
            startCursor: db.users.admin.id,
            endCursor: db.users.admin.id,
          },
        },
        (pageInfo: PageInfo) => ({
          ...(pageInfo.startCursor != null && {
            before: pageInfo.startCursor,
          }),
        }),
        {
          length: 1,
          users: [dto.users.alice],
          pageInfo: {
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: db.users.alice.id,
            endCursor: db.users.alice.id,
          },
        },
      ],
    ];

    test.each(patterns)("patterns %#", async (args, firstExpect, makeCursor, secondExpect) => {
      const result1 = await users(ctx, args);
      assert(result1?.nodes);
      expect(result1.nodes.length).toBe(firstExpect.length);
      expect(result1.pageInfo).toStrictEqual(firstExpect.pageInfo);
      expect(result1.nodes).toStrictEqual(firstExpect.users);

      const result2 = await users(ctx, { ...args, ...makeCursor(result1.pageInfo) });
      assert(result2?.nodes);
      expect(result2.nodes.length).toBe(secondExpect.length);
      expect(result2.pageInfo).toStrictEqual(secondExpect.pageInfo);
      expect(result2.nodes).toStrictEqual(secondExpect.users);
    });
  });
});
