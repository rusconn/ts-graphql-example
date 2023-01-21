import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { UpdateMeMutation, UpdateMeMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      id
      name
      updatedAt
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  UpdateMeMutation,
  UpdateMeMutationVariables
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

  const alloweds = [ContextData.admin, ContextData.alice, ContextData.bob] as const;
  const notAlloweds = [ContextData.guest] as const;

  test.each(alloweds)("allowed %o %o", async user => {
    const { data, errors } = await executeMutation({
      user,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateMe).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o %o", async user => {
    const { data, errors } = await executeMutation({
      user,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.updateMe).toBeFalsy();
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

      expect(data?.updateMe).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async name => {
      const { data, errors } = await executeMutation({
        variables: { input: { name: nonEmptyString(name) } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateMe).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("null name should cause bad input error", async () => {
      const { data, errors } = await executeMutation({
        variables: { input: { name: null } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateMe).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("absent name should not cause bad input error", async () => {
      const { data, errors } = await executeMutation({
        variables: { input: {} },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.updateMe).not.toBeFalsy();
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
      variables: { input: { name } },
    });

    if (!data || !data.updateMe) {
      throw new Error("operation failed");
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    expect(user.name).toBe(name);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    const { data } = await executeMutation({
      variables: { input: {} },
    });

    if (!data || !data.updateMe) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    expect(before.name).toBe(after.name);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    const { data } = await executeMutation({
      variables: { input: { name: nonEmptyString("bar") } },
    });

    if (!data || !data.updateMe) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    const { data } = await executeMutation({
      variables: { input: { name: nonEmptyString("baz") } },
    });

    if (!data || !data.updateMe) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["name", "updatedAt"]);
    const afterToCompare = omit(after, ["name", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
