import { gql } from "graphql-tag";

import type { SignupMutation, SignupMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as DataSource from "@/datasources";
import { splitUserNodeId } from "@/graphql/adapters";
import { Graph } from "@/graphql/types";
import { emailAddress, nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input)
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  SignupMutation,
  SignupMutationVariables
>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
  });

  const variables = {
    input: {
      name: nonEmptyString("foo"),
      email: emailAddress("guest@guest.com"),
      password: nonEmptyString("password"),
    },
  };

  const alloweds = [ContextData.guest];
  const notAlloweds = [ContextData.admin, ContextData.alice, ContextData.bob];

  test.each(alloweds)("allowed %o", async user => {
    const { data, errors } = await executeMutation({ user, variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.signup).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async user => {
    const { data, errors } = await executeMutation({ user, variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.signup).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$input", () => {
    beforeEach(async () => {
      await clearTables();
      await seedUsers();
    });

    // 文字数は文字列の長さやバイト数とは異なるので注意
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length#unicode
    // 合字は複数文字とカウントしていいものとする
    const nameMaxCharacters = 100;
    const emailMaxCharacters = 100;
    const passwordMinCharacters = 8;
    const passwordMaxCharacters = 50;

    const valids = [
      { name: "A".repeat(nameMaxCharacters), email: "email@email.com", password: "password" },
      { name: "🅰".repeat(nameMaxCharacters), email: "email@email.com", password: "password" },
      { name: "name", email: `${"a".repeat(emailMaxCharacters - 5)}@a.jp`, password: "password" },
      { name: "name", email: "email@email.com", password: "a".repeat(passwordMinCharacters) },
      { name: "name", email: "email@email.com", password: "a".repeat(passwordMaxCharacters) },
    ];

    const invalids = [
      { name: "A".repeat(nameMaxCharacters + 1), email: "email@email.com", password: "password" },
      { name: "🅰".repeat(nameMaxCharacters + 1), email: "email@email.com", password: "password" },
      {
        name: "name",
        email: `${"a".repeat(emailMaxCharacters - 5 + 1)}@a.jp`,
        password: "password",
      },
      { name: "name", email: "email@email.com", password: "a".repeat(passwordMinCharacters - 1) },
      { name: "name", email: "email@email.com", password: "a".repeat(passwordMaxCharacters + 1) },
    ];

    test.each(valids)("valid %s", async ({ name, email, password }) => {
      const { data, errors } = await executeMutation({
        user: ContextData.guest,
        variables: {
          input: {
            name: nonEmptyString(name),
            email: emailAddress(email),
            password: nonEmptyString(password),
          },
        },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.signup).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async ({ name, email, password }) => {
      const { data, errors } = await executeMutation({
        user: ContextData.guest,
        variables: {
          input: {
            name: nonEmptyString(name),
            email: emailAddress(email),
            password: nonEmptyString(password),
          },
        },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.signup).toBeNull();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
  });

  test("email already exists", async () => {
    const name = nonEmptyString("foo");
    const email = emailAddress(DBData.admin.email);
    const password = nonEmptyString("password");

    const { data, errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.signup).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.AlreadyExists]));
  });

  it("should create user using input", async () => {
    const name = nonEmptyString("foo");
    const email = emailAddress("foo@foo.com");
    const password = nonEmptyString("password");

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    if (!data || !data.signup) {
      throw new Error("operation failed");
    }

    const { id } = splitUserNodeId(data.signup);

    const user = await prisma.user.findUniqueOrThrow({ where: { id } });

    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
  });

  test("role should be USER by default", async () => {
    const name = nonEmptyString("bar");
    const email = emailAddress("bar@bar.com");
    const password = nonEmptyString("password");

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    if (!data || !data.signup) {
      throw new Error("operation failed");
    }

    const { id } = splitUserNodeId(data.signup);

    const user = await prisma.user.findUniqueOrThrow({ where: { id } });

    expect(user.role).toBe(DataSource.Role.USER);
  });
});
