import type { GraphQLFormattedError } from "graphql";
import { gql } from "apollo-server";

import type { DeleteTodoMutation, DeleteTodoMutationVariables } from "it/types";
import {
  admin,
  adminTodo1,
  adminTodo2,
  adminTodo3,
  alice,
  aliceTodo,
  bob,
  bobTodo,
  guest,
  invalidTodoIds,
  validTodoIds,
} from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { nonEmptyString } from "@/utils";
import { ErrorCode, User } from "@/types";

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3, aliceTodo, bobTodo];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
    }
  }
`;

type ResponseType = {
  data?: DeleteTodoMutation | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables: DeleteTodoMutationVariables;
};

/**
 * token のデフォルトは admin.token
 * @param params token の上書きや variables の指定に使う
 */
const executeMutation = (params: ExecuteQueryParams) => {
  const token = "token" in params ? params.token : admin.token;
  const { variables } = params;

  return server.executeOperation(
    { query, variables },
    makeContext({ query, token })
  ) as Promise<ResponseType>;
};

describe("authorization", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  const variables = { input: { name: nonEmptyString("foo") } };

  const allowedPatterns = [
    [admin, adminTodo1],
    [admin, aliceTodo],
    [alice, aliceTodo],
  ] as const;

  const notAllowedPatterns = [
    [alice, adminTodo1],
    [alice, bobTodo],
    [guest, adminTodo1],
    [guest, aliceTodo],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteTodo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    beforeEach(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

    test.each(validTodoIds)("valid %s", async id => {
      const { errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidTodoIds)("invalid %s", async id => {
      const { errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  it("should delete todo", async () => {
    const { data } = await executeMutation({ variables: { id: adminTodo1.id } });

    if (!data || !data.deleteTodo) {
      throw new Error("operation failed");
    }

    const maybeTodo = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    expect(maybeTodo).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await prisma.todo.count();

    const { data } = await executeMutation({ variables: { id: adminTodo1.id } });

    if (!data || !data.deleteTodo) {
      throw new Error("operation failed");
    }

    const maybeTodo = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    const after = await prisma.todo.count();

    expect(maybeTodo).toBeNull();
    expect(after).toBe(before - 1);
  });
});
