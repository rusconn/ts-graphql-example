import type { GraphQLFormattedError } from "graphql";
import range from "lodash/range";
import { gql } from "apollo-server";

import type { UserQuery, UserQueryVariables } from "it/types";
import {
  admin,
  alice,
  bob,
  adminTodo1,
  adminTodo2,
  adminTodo3,
  guest,
  validUserIds,
  invalidUserIds,
} from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { getEnvsWithValidation, makeServer, userId } from "@/utils";
import { ErrorCode, OrderDirection, TodoOrderField, User } from "@/types";

const envs = getEnvsWithValidation();
const server = makeServer({ ...envs, prisma });

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedAdminTodos = () => prisma.todo.createMany({ data: todos });

const numSeedTodos = todos.length;

const query = gql`
  query User(
    $id: ID!
    $includeToken: Boolean = false
    $includeRole: Boolean = false
    $includeTodos: Boolean = false
    $first: Int
    $after: String
    $last: Int
    $before: String
    $orderBy: TodoOrder
  ) {
    user(id: $id) {
      id
      createdAt
      updatedAt
      name
      token @include(if: $includeToken)
      role @include(if: $includeRole)
      todos(first: $first, after: $after, last: $last, before: $before, orderBy: $orderBy)
        @include(if: $includeTodos) {
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
            status
          }
        }
      }
    }
  }
`;

type ResponseType = {
  data?: UserQuery | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables: UserQueryVariables;
};

/**
 * token のデフォルトは admin.token
 * @param params token の上書きや variables の指定に使う
 */
const executeQuery = (params: ExecuteQueryParams) => {
  const token = "token" in params ? params.token : admin.token;
  const { variables } = params;

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
  describe("query user", () => {
    const allowedPatterns = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
      [bob, bob],
    ] as const;

    const notAllowedPatterns = [
      [alice, bob],
      [bob, alice],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async ({ token }, { id }) => {
      const { data, errors } = await executeQuery({ token, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async ({ token }, { id }) => {
      const { data, errors } = await executeQuery({ token, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });
  });

  describe("query subfields", () => {
    const allowedPatterns = [
      [admin, admin, { includeToken: true }],
      [alice, alice, { includeToken: true }],
      [admin, alice, { includeRole: true }],
      [admin, admin, { includeRole: true }],
    ] as const;

    const notAllowedPatterns = [
      [admin, alice, { includeToken: true }],
      [alice, admin, { includeToken: true }],
      [alice, admin, { includeRole: true }],
      [alice, alice, { includeRole: true }],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async ({ token }, { id }, options) => {
      const { data, errors } = await executeQuery({
        token,
        variables: { id, ...options },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async ({ token }, { id }, options) => {
      const { data, errors } = await executeQuery({
        token,
        variables: { id, ...options },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(validUserIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });

  describe("todos arguments", () => {
    const firstMax = 50;
    const lastMax = 50;

    const valids = [
      {},
      { first: firstMax },
      { last: lastMax },
      { first: 1, after: adminTodo1.id },
      { last: 1, before: adminTodo3.id },
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
      { last: 1, after: adminTodo3.id },
    ];

    test.each(valids)("valid %o", async variables => {
      const { data, errors } = await executeQuery({
        variables: { ...variables, id: admin.id, includeTodos: true },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %o", async variables => {
      const { data, errors } = await executeQuery({
        variables: { ...variables, id: admin.id, includeTodos: true },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });
});

describe("query without other nodes", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({
      variables: { id: admin.id, includeToken: true, includeRole: true },
    });

    expect(data?.user).toEqual(admin);
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({ variables: { id: userId() } });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
  });
});

describe("query other nodes: todos", () => {
  describe("number of items", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedAdminTodos();
    });

    it("should be 20 by default", async () => {
      const numDefault = 20;
      const numAdditionals = numDefault - numSeedTodos + 1;

      // id が衝突しないようにしている
      const additionals = range(numAdditionals).map(x => ({
        id: userId(),
        title: `${x}`,
        userId: admin.id,
      }));

      await prisma.todo.createMany({ data: additionals });

      const { data } = await executeQuery({
        variables: { id: admin.id, includeTodos: true },
      });

      const numTodos = await prisma.todo.count();

      expect(numTodos).toBe(numDefault + 1);
      expect(data?.user?.todos?.edges).toHaveLength(numDefault);
    });

    it("should affected by first option", async () => {
      const first = numSeedTodos - 1;

      const { data } = await executeQuery({
        variables: { id: admin.id, includeTodos: true, first },
      });

      expect(data?.user?.todos?.edges).toHaveLength(first);
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

    test.each(patterns)("%o %o", async (variables, expectedTodos) => {
      const { data } = await executeQuery({
        variables: { ...variables, id: admin.id, includeTodos: true },
      });

      const ids = data?.user?.todos?.edges.map(({ node }) => node.id);
      const expectedIds = expectedTodos.map(({ id }) => id);

      expect(ids).toStrictEqual(expectedIds);
    });
  });

  describe("pagination", () => {
    it("should not works by default", async () => {
      const first = numSeedTodos - 1;

      const makeExecution = () =>
        executeQuery({ variables: { id: admin.id, includeTodos: true, first } });

      const { data: data1 } = await makeExecution();
      const { data: data2 } = await makeExecution();

      expect(data1?.user?.todos?.edges).toHaveLength(first);
      expect(data2?.user?.todos?.edges).toHaveLength(first);
      expect(data1).toStrictEqual(data2);
    });
  });
});
