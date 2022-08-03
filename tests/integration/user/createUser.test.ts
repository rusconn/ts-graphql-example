import type { GraphQLFormattedError } from "graphql";
import { gql } from "apollo-server";

import type { CreateUserMutation, CreateUserMutationVariables } from "it/types";
import { admin, alice, bob, guest } from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { Role } from "@prisma/client";
import { nonEmptyString } from "@/utils";
import { ErrorCode, User } from "@/types";

const seedUsers = () => prisma.user.createMany({ data: [admin, alice, bob] });

const query = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
    }
  }
`;

type ResponseType = {
  data?: CreateUserMutation | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables: CreateUserMutationVariables;
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

  const variables = { input: { name: nonEmptyString("foo") } };

  const alloweds = [admin, guest];
  const notAlloweds = [alice, bob];

  test.each(alloweds)("allowed %o", async ({ token }) => {
    const { data, errors } = await executeMutation({ token, variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createUser).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async ({ token }) => {
    const { data, errors } = await executeMutation({ token, variables });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.createUser).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
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
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.createUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
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

    const maybeUser = await prisma.user.findUnique({ where: { id: data.createUser.id } });

    expect(maybeUser?.name).toBe(name);
  });

  test("role should be USER by default", async () => {
    const name = nonEmptyString("bar");

    const { data } = await executeMutation({ variables: { input: { name } } });

    if (!data || !data.createUser) {
      throw new Error("operation failed");
    }

    const maybeUser = await prisma.user.findUnique({ where: { id: data.createUser.id } });

    expect(maybeUser?.role).toBe(Role.USER);
  });
});
