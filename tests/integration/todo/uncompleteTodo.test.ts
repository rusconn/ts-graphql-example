import type { GraphQLFormattedError } from "graphql";
import omit from "lodash/omit";
import { gql } from "apollo-server";

import type { UncompleteTodoMutation, UncompleteTodoMutationVariables } from "it/types";
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
  invalidTodoNodeIds,
  validTodoNodeIds,
} from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { getEnvsWithValidation, makeServer, toTodoNodeId } from "@/utils";
import { ErrorCode, TodoStatus, User } from "@/types";

const envs = getEnvsWithValidation();
const server = makeServer({ ...envs, prisma });

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3, aliceTodo, bobTodo];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const resetAdminTodoValue = () =>
  prisma.todo.upsert({ where: { id: adminTodo1.id }, create: adminTodo1, update: adminTodo1 });

const completeAdminTodo = () =>
  prisma.todo.update({ where: { id: adminTodo1.id }, data: { status: TodoStatus.Done } });

const query = gql`
  mutation UncompleteTodo($id: ID!) {
    uncompleteTodo(id: $id) {
      id
      updatedAt
      title
      description
      status
    }
  }
`;

type ResponseType = {
  data?: UncompleteTodoMutation | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables: UncompleteTodoMutationVariables;
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

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

describe("authorization", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

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
      variables: { id: toTodoNodeId(id) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.uncompleteTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { id: toTodoNodeId(id) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.uncompleteTodo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

    test.each(validTodoNodeIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.uncompleteTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidTodoNodeIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.uncompleteTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await resetAdminTodoValue();
    await completeAdminTodo();
  });

  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  it("should update status", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    const { data } = await executeMutation({ variables: { id: toTodoNodeId(adminTodo1.id) } });

    if (!data || !data.uncompleteTodo) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    expect(before?.status).toBe(TodoStatus.Done);
    expect(after?.status).toBe(TodoStatus.Pending);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!before) {
      throw new Error("test todo not set");
    }

    const { data } = await executeMutation({ variables: { id: toTodoNodeId(adminTodo1.id) } });

    if (!data || !data.uncompleteTodo) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!after) {
      throw new Error("test todo not set");
    }

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!before) {
      throw new Error("test todo not set");
    }

    const { data } = await executeMutation({ variables: { id: toTodoNodeId(adminTodo1.id) } });

    if (!data || !data.uncompleteTodo) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!after) {
      throw new Error("test todo not set");
    }

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["status", "updatedAt"]);
    const afterToCompare = omit(after, ["status", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
