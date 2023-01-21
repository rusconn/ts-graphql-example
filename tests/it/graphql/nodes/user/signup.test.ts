import { gql } from "graphql-tag";

import type { SignupMutation, SignupMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { userAPI } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as DataSource from "@/datasources";
import { splitUserNodeId } from "@/graphql/adapters";
import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => userAPI.createManyForTest(users);

const query = gql`
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      id
      name
    }
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
  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  const variables = { input: { name: nonEmptyString("foo") } };

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
        user: ContextData.guest,
        variables: { input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.signup).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async name => {
      const { data, errors } = await executeMutation({
        user: ContextData.guest,
        variables: { input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.signup).toBeFalsy();
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

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name } },
    });

    if (!data || !data.signup) {
      throw new Error("operation failed");
    }

    const { id } = splitUserNodeId(data.signup.id);

    const user = await userAPI.get({ id });

    expect(user.name).toBe(name);
  });

  test("role should be USER by default", async () => {
    const name = nonEmptyString("bar");

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name } },
    });

    if (!data || !data.signup) {
      throw new Error("operation failed");
    }

    const { id } = splitUserNodeId(data.signup.id);

    const user = await userAPI.get({ id });

    expect(user.role).toBe(DataSource.Role.USER);
  });
});
