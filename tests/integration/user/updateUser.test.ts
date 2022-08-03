import type { GraphQLFormattedError } from "graphql";
import omit from "lodash/omit";
import { gql } from "apollo-server";

import type { UpdateUserMutation, UpdateUserMutationVariables } from "it/types";
import { admin, alice, bob, guest, invalidUserIds, validUserIds } from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { nonEmptyString } from "@/utils";
import { ErrorCode, User } from "@/types";

const seedUsers = () => prisma.user.createMany({ data: [admin, alice, bob] });

const query = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`;

type ResponseType = {
  data?: UpdateUserMutation | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables: UpdateUserMutationVariables;
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

  const input = { name: nonEmptyString("foo") };

  const allowedPatterns = [
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const notAllowedPatterns = [
    [alice, admin],
    [alice, bob],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateUser).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateUser).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
    });

    const input = { name: nonEmptyString("foo") };

    test.each(validUserIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id, input } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id, input } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).toBeFalsy();
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
    const nameMaxCharacters = 100;

    const valids = ["A".repeat(nameMaxCharacters), "🅰".repeat(nameMaxCharacters)];
    const invalids = ["A".repeat(nameMaxCharacters + 1), "🅰".repeat(nameMaxCharacters + 1)];

    test.each(valids)("valid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { id: admin.id, input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { id: admin.id, input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test("null name should cause bad input error", async () => {
      const { data, errors } = await executeMutation({
        variables: { id: admin.id, input: { name: null } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test("absent name should not cause bad input error", async () => {
      const { data, errors } = await executeMutation({
        variables: { id: admin.id, input: {} },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  it("should update using input", async () => {
    const name = nonEmptyString("foo");

    const { data } = await executeMutation({
      variables: { id: admin.id, input: { name } },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const maybeUser = await prisma.user.findUnique({ where: { id: data.updateUser.id } });

    expect(maybeUser?.name).toBe(name);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.user.findUnique({ where: { id: admin.id } });

    if (!before) {
      throw new Error("user not found");
    }

    const { data } = await executeMutation({
      variables: { id: admin.id, input: {} },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUnique({ where: { id: data.updateUser.id } });

    if (!after) {
      throw new Error("user not found");
    }

    expect(before.name).toBe(after.name);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.user.findUnique({ where: { id: admin.id } });

    if (!before) {
      throw new Error("test user not set");
    }

    const { data } = await executeMutation({
      variables: { id: admin.id, input: { name: nonEmptyString("bar") } },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUnique({ where: { id: admin.id } });

    if (!after) {
      throw new Error("test user not set");
    }

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.user.findUnique({ where: { id: admin.id } });

    if (!before) {
      throw new Error("test user not set");
    }

    const { data } = await executeMutation({
      variables: { id: admin.id, input: { name: nonEmptyString("baz") } },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUnique({ where: { id: admin.id } });

    if (!after) {
      throw new Error("test user not set");
    }

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["name", "updatedAt"]);
    const afterToCompare = omit(after, ["name", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
