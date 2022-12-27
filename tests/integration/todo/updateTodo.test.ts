import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { UpdateTodoMutation, UpdateTodoMutationVariables } from "it/types";
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
import { nonEmptyString } from "@/utils";
import { ErrorCode, TodoStatus } from "@/types";

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3, aliceTodo, bobTodo];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      id
      updatedAt
      title
      description
      status
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  UpdateTodoMutation,
  UpdateTodoMutationVariables
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

  const input = { title: nonEmptyString("foo"), description: "", status: TodoStatus.Done };

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
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateTodo).toBeFalsy();
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

    const input = { title: nonEmptyString("foo"), description: "", status: TodoStatus.Done };

    test.each(validTodoIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id, input } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidTodoIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id, input } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });

  describe("$input", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

    // 文字数は文字列の長さやバイト数とは異なるので注意
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length#unicode
    // 合字は複数文字とカウントしていいものとする
    const titleMaxCharacters = 100;
    const descriptionMaxCharacters = 5000;

    const valids = [
      ["A".repeat(titleMaxCharacters), ""],
      ["🅰".repeat(titleMaxCharacters), ""],
      ["A", "A".repeat(descriptionMaxCharacters)],
      ["🅰", "🅰".repeat(descriptionMaxCharacters)],
    ].map(([title, description]) => ({
      title: nonEmptyString(title),
      description,
      status: TodoStatus.Done,
    }));

    const invalids = [
      ["A".repeat(titleMaxCharacters + 1), ""],
      ["🅰".repeat(titleMaxCharacters + 1), ""],
      ["A", "A".repeat(descriptionMaxCharacters + 1)],
      ["🅰", "🅰".repeat(descriptionMaxCharacters + 1)],
    ].map(([title, description]) => ({
      title: nonEmptyString(title),
      description,
      status: TodoStatus.Done,
    }));

    test.each(valids)("valid %s", async input => {
      const { data, errors } = await executeMutation({
        variables: { input, id: adminTodo1.id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async input => {
      const { data, errors } = await executeMutation({
        variables: { input, id: adminTodo1.id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    const validPartialInputs = [
      { description: "", status: TodoStatus.Done },
      { status: TodoStatus.Done, title: nonEmptyString("x") },
      { title: nonEmptyString("x"), description: "" },
    ];

    const invalidPartialInputs = [{ title: null }, { description: null }, { status: null }];

    test.each(validPartialInputs)(
      "field absence should not cause bad input error: %s",
      async input => {
        const { data, errors } = await executeMutation({
          variables: { input, id: adminTodo1.id },
        });

        const errorCodes = errors?.map(({ extensions }) => extensions?.code);

        expect(data?.updateTodo).not.toBeFalsy();
        expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
      }
    );

    test.each(invalidPartialInputs)(
      "some fields should cause bad input error if null: %s",
      async input => {
        const { data, errors } = await executeMutation({
          variables: { input, id: adminTodo1.id },
        });

        const errorCodes = errors?.map(({ extensions }) => extensions?.code);

        expect(data?.updateTodo).toBeFalsy();
        expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
      }
    );
  });
});

describe("logic", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  it("should update using input", async () => {
    const input = { title: nonEmptyString("bar"), description: "baz", status: TodoStatus.Done };

    const { data } = await executeMutation({
      variables: { id: adminTodo1.id, input },
    });

    if (!data || !data.updateTodo) {
      throw new Error("operation failed");
    }

    const maybeUser = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    expect(maybeUser?.title).toBe(input.title);
    expect(maybeUser?.description).toBe(input.description);
    expect(maybeUser?.status).toBe(input.status);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!before) {
      throw new Error("todo not found");
    }

    const { data } = await executeMutation({
      variables: { id: adminTodo1.id, input: {} },
    });

    if (!data || !data.updateTodo) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.findUnique({ where: { id: data.updateTodo.id } });

    if (!after) {
      throw new Error("user not found");
    }

    expect(before.title).toBe(after.title);
    expect(before.description).toBe(after.description);
    expect(before.status).toBe(after.status);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!before) {
      throw new Error("test user not set");
    }

    const input = { title: nonEmptyString("bar"), description: "baz", status: TodoStatus.Done };

    const { data } = await executeMutation({
      variables: { id: adminTodo1.id, input },
    });

    if (!data || !data.updateTodo) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!after) {
      throw new Error("test user not set");
    }

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!before) {
      throw new Error("test user not set");
    }

    const input = { title: nonEmptyString("bar"), description: "baz", status: TodoStatus.Done };

    const { data } = await executeMutation({
      variables: { id: adminTodo1.id, input },
    });

    if (!data || !data.updateTodo) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.findUnique({ where: { id: adminTodo1.id } });

    if (!after) {
      throw new Error("test user not set");
    }

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["title", "description", "status", "updatedAt"]);
    const afterToCompare = omit(after, ["title", "description", "status", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
