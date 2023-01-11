import { TodoStatus } from "@prisma/client";
import { gql } from "graphql-tag";

import type { CreateTodoMutation, CreateTodoMutationVariables } from "it/graphql/types";
import { admin, alice, bob, guest, invalidUserIds, validUserIds } from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

const seedUsers = () => prisma.user.createMany({ data: [admin, alice, bob] });

const query = gql`
  mutation CreateTodo($userId: ID!, $input: CreateTodoInput!) {
    createTodo(userId: $userId, input: $input) {
      id
      title
      description
      status
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  CreateTodoMutation,
  CreateTodoMutationVariables
>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  const variables = { input: { title: nonEmptyString("title"), description: "" } };

  const allowedPatterns = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const notAllowedPatterns = [
    [alice, bob],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { ...variables, userId: id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { ...variables, userId: id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createTodo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$userId", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
    });

    const variables = { input: { title: nonEmptyString("title"), description: "" } };

    test.each(validUserIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { ...variables, userId: id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { ...variables, userId: id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });

  describe("$input", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
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
    ].map(([title, description]) => ({ title: nonEmptyString(title), description }));

    const invalids = [
      ["A".repeat(titleMaxCharacters + 1), ""],
      ["🅰".repeat(titleMaxCharacters + 1), ""],
      ["A", "A".repeat(descriptionMaxCharacters + 1)],
      ["🅰", "🅰".repeat(descriptionMaxCharacters + 1)],
    ].map(([title, description]) => ({ title: nonEmptyString(title), description }));

    test.each(valids)("valid %s", async input => {
      const { data, errors } = await executeMutation({
        variables: { input, userId: admin.id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async input => {
      const { data, errors } = await executeMutation({
        variables: { input, userId: admin.id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  const input = { title: nonEmptyString("foo"), description: "bar" };

  it("should create todo using input", async () => {
    const { data } = await executeMutation({
      variables: { input, userId: admin.id },
    });

    if (!data || !data.createTodo) {
      throw new Error("operation failed");
    }

    const maybeTodo = await prisma.todo.findUnique({ where: { id: data.createTodo.id } });

    expect(maybeTodo?.title).toBe(input.title);
    expect(maybeTodo?.description).toBe(input.description);
  });

  test("status should be PENDING by default", async () => {
    const { data } = await executeMutation({
      variables: { input, userId: admin.id },
    });

    if (!data || !data.createTodo) {
      throw new Error("operation failed");
    }

    const maybeTodo = await prisma.todo.findUnique({ where: { id: data.createTodo.id } });

    expect(maybeTodo?.status).toBe(TodoStatus.PENDING);
  });
});