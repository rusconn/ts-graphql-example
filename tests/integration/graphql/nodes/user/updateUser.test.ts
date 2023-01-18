import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { UpdateUserMutation, UpdateUserMutationVariables } from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { userAPI } from "it/datasources";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => userAPI.createMany(users);

const query = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      updatedAt
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  UpdateUserMutation,
  UpdateUserMutationVariables
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

  const input = { name: nonEmptyString("foo") };

  const allowedPatterns = [
    [ContextData.admin, GraphData.admin],
    [ContextData.admin, GraphData.alice],
    [ContextData.alice, GraphData.alice],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.alice, GraphData.admin],
    [ContextData.alice, GraphData.bob],
    [ContextData.guest, GraphData.admin],
    [ContextData.guest, GraphData.alice],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateUser).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateUser).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
    });

    const input = { name: nonEmptyString("foo") };

    test.each(GraphData.validUserIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id, input } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id, input } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).toBeFalsy();
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
    const nameMaxCharacters = 100;

    const valids = ["A".repeat(nameMaxCharacters), "🅰".repeat(nameMaxCharacters)];
    const invalids = ["A".repeat(nameMaxCharacters + 1), "🅰".repeat(nameMaxCharacters + 1)];

    test.each(valids)("valid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { id: GraphData.admin.id, input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { id: GraphData.admin.id, input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("null name should cause bad input error", async () => {
      const { data, errors } = await executeMutation({
        variables: { id: GraphData.admin.id, input: { name: null } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("absent name should not cause bad input error", async () => {
      const { data, errors } = await executeMutation({
        variables: { id: GraphData.admin.id, input: {} },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
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
      variables: { id: GraphData.admin.id, input: { name } },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const maybeUser = await prisma.user.findUnique({ where: { id: DBData.admin.id } });

    expect(maybeUser?.name).toBe(name);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.user.findUnique({ where: { id: DBData.admin.id } });

    if (!before) {
      throw new Error("user not found");
    }

    const { data } = await executeMutation({
      variables: { id: GraphData.admin.id, input: {} },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUnique({ where: { id: DBData.admin.id } });

    if (!after) {
      throw new Error("user not found");
    }

    expect(before.name).toBe(after.name);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.user.findUnique({ where: { id: DBData.admin.id } });

    if (!before) {
      throw new Error("test user not set");
    }

    const { data } = await executeMutation({
      variables: { id: GraphData.admin.id, input: { name: nonEmptyString("bar") } },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUnique({ where: { id: DBData.admin.id } });

    if (!after) {
      throw new Error("test user not set");
    }

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.user.findUnique({ where: { id: DBData.admin.id } });

    if (!before) {
      throw new Error("test user not set");
    }

    const { data } = await executeMutation({
      variables: { id: GraphData.admin.id, input: { name: nonEmptyString("baz") } },
    });

    if (!data || !data.updateUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUnique({ where: { id: DBData.admin.id } });

    if (!after) {
      throw new Error("test user not set");
    }

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["name", "updatedAt"]);
    const afterToCompare = omit(after, ["name", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
