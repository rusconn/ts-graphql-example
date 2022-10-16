import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { TodoQuery, TodoQueryVariables } from "it/types";
import { defaultContext } from "it/context";
import {
  admin,
  alice,
  bob,
  adminTodo1,
  adminTodo2,
  adminTodo3,
  guest,
  aliceTodo,
  bobTodo,
  validTodoIds,
  invalidTodoIds,
} from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { todoId } from "@/utils";
import { Context, ErrorCode } from "@/types";

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3, aliceTodo, bobTodo];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  query Todo($id: ID!, $includeUser: Boolean = false) {
    todo(id: $id) {
      id
      createdAt
      updatedAt
      title
      description
      status
      user @include(if: $includeUser) {
        id
        createdAt
        updatedAt
        name
        role
        token
      }
    }
  }
`;

type ExecuteQueryParams = {
  user?: Context["user"];
  variables: TodoQueryVariables;
};

/**
 * user のデフォルトは admin
 * @param params user の上書きや variables の指定に使う
 */
const executeQuery = async (params: ExecuteQueryParams) => {
  const user = params.user ?? admin;
  const { variables } = params;

  const res = await server.executeOperation<TodoQuery>(
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
  await seedTodos();
});

describe("authorization", () => {
  const allowedPatterns = [
    [admin, adminTodo1],
    [admin, aliceTodo],
    [alice, aliceTodo],
  ] as const;

  const notAllowedPatterns = [
    [alice, bobTodo],
    [guest, adminTodo1],
    [guest, aliceTodo],
  ] as const;

  test.each(allowedPatterns)("allowed %o", async (user, { id }) => {
    const { data, errors } = await executeQuery({ user, variables: { id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
    const { data, errors } = await executeQuery({ user, variables: { id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(validTodoIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.todo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidTodoIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.todo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });
});

describe("query without other nodes", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({ variables: { id: adminTodo1.id } });

    expect(data?.todo).toEqual({ ...omit(adminTodo1, "userId"), id: adminTodo1.id });
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({ variables: { id: todoId() } });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
  });
});

describe("query other nodes: user", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({
      variables: { id: adminTodo1.id, includeUser: true },
    });

    expect(data?.todo?.user).toEqual(admin);
  });
});
