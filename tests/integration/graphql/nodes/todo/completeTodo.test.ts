import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { CompleteTodoMutation, CompleteTodoMutationVariables } from "it/graphql/types";
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
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3, aliceTodo, bobTodo];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const resetAdminTodoValue = () =>
  prisma.todo.upsert({ where: { id: adminTodo1.id }, create: adminTodo1, update: adminTodo1 });

const query = gql`
  mutation CompleteTodo($id: ID!) {
    completeTodo(id: $id) {
      id
      updatedAt
      title
      description
      status
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  CompleteTodoMutation,
  CompleteTodoMutationVariables
>;

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

    expect(data?.completeTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.completeTodo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
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

      expect(data?.completeTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalidTodoIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.completeTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(resetAdminTodoValue);

  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  it("should update status", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    const { data } = await executeMutation({ variables: { id: adminTodo1.id } });

    if (!data || !data.completeTodo) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    expect(before?.status).toBe(Graph.TodoStatus.Pending);
    expect(after?.status).toBe(Graph.TodoStatus.Done);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!before) {
      throw new Error("test todo not set");
    }

    const { data } = await executeMutation({ variables: { id: adminTodo1.id } });

    if (!data || !data.completeTodo) {
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

    if (!data || !data.completeTodo) {
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