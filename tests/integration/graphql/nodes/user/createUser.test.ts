import { gql } from "graphql-tag";

import type { CreateUserMutation, CreateUserMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { userAPI } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { splitUserNodeId } from "@/adapters";
import * as DataSource from "@/datasources";
import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => userAPI.createMany(users);

const query = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  CreateUserMutation,
  CreateUserMutationVariables
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

  const variables = { input: { name: nonEmptyString("foo") } };

  const alloweds = [ContextData.admin, ContextData.guest];
  const notAlloweds = [ContextData.alice, ContextData.bob];

  test.each(alloweds)("allowed %o", async user => {
    const { data, errors } = await executeMutation({ user, variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createUser).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async user => {
    const { data, errors } = await executeMutation({ user, variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createUser).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$input", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
    });

    // 文字数は文字列の長さやバイト数とは異なるので注意
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length#unicode
    // 合字は複数文字とカウントしていいものとする
    const nameMaxCharacters = 100;

    const valids = ["A".repeat(nameMaxCharacters), "🅰".repeat(nameMaxCharacters)];
    const invalids = ["A".repeat(nameMaxCharacters + 1), "🅰".repeat(nameMaxCharacters + 1)];

    test.each(valids)("valid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  it("should create user using input name", async () => {
    const name = nonEmptyString("foo");

    const { data } = await executeMutation({ variables: { input: { name } } });

    if (!data || !data.createUser) {
      throw new Error("operation failed");
    }

    const { id } = splitUserNodeId(data.createUser.id);

    const user = await userAPI.get({ id });

    expect(user.name).toBe(name);
  });

  test("role should be USER by default", async () => {
    const name = nonEmptyString("bar");

    const { data } = await executeMutation({ variables: { input: { name } } });

    if (!data || !data.createUser) {
      throw new Error("operation failed");
    }

    const { id } = splitUserNodeId(data.createUser.id);

    const user = await userAPI.get({ id });

    expect(user.role).toBe(DataSource.Role.USER);
  });
});
