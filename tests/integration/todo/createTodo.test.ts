import type { GraphQLFormattedError } from "graphql";
import { gql } from "apollo-server";

import type { CreateTodoMutation, CreateTodoMutationVariables } from "it/types";
import { admin, alice, bob, guest, invalidUserIds, validUserIds } from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { TodoStatus } from "@prisma/client";
import { nonEmptyString } from "@/utils";
import { ErrorCode, User } from "@/types";

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

type ResponseType = {
  data?: CreateTodoMutation | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables: CreateTodoMutationVariables;
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

  test.each(allowedPatterns)("allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { ...variables, userId: id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { ...variables, userId: id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createTodo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
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
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { ...variables, userId: id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
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
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async input => {
      const { data, errors } = await executeMutation({
        variables: { input, userId: admin.id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
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
