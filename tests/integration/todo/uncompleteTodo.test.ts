import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { UncompleteTodoMutation, UncompleteTodoMutationVariables } from "it/types";
import { defaultContext } from "it/context";
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
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { Context, ErrorCode, TodoStatus } from "@/types";

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

type ExecuteQueryParams = {
  user?: Context["user"];
  variables: UncompleteTodoMutationVariables;
};

/**
 * user のデフォルトは admin
 * @param params user の上書きや variables の指定に使う
 */
const executeMutation = async (params: ExecuteQueryParams) => {
  const user = params.user ?? admin;
  const { variables } = params;

  const res = await server.executeOperation<UncompleteTodoMutation>(
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

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.uncompleteTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { id },
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

    test.each(validTodoIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.uncompleteTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidTodoIds)("invalid %s", async id => {
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

    const { data } = await executeMutation({ variables: { id: adminTodo1.id } });

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

    const { data } = await executeMutation({ variables: { id: adminTodo1.id } });

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

    const { data } = await executeMutation({ variables: { id: adminTodo1.id } });

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
