import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { UpdateMeMutation, UpdateMeMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";
import { emailAddress, nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = gql`
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      ... on UpdateMeSucceeded {
        __typename
        user {
          id
          name
          email
          updatedAt
        }
      }
      ... on EmailAlreadyTakenError {
        __typename
        message
      }
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
    const { errors } = await executeMutation({
      user,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o %o", async user => {
    const { errors } = await executeMutation({
      user,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

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
      const { errors } = await executeMutation({
        variables: {
          input: {
            name: nonEmptyString(name),
            email: emailAddress(email),
            password: nonEmptyString(password),
          },
        },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async ({ name, email, password }) => {
      const { errors } = await executeMutation({
        variables: {
          input: {
            name: nonEmptyString(name),
            email: emailAddress(email),
            password: nonEmptyString(password),
          },
        },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("null name should cause input error", async () => {
      const { errors } = await executeMutation({
        variables: { input: { name: null } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("absent name should not cause input error", async () => {
      const { errors } = await executeMutation({
        variables: { input: {} },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
  });

  test("email already exists", async () => {
    const email = emailAddress(DBData.alice.email);

    const { data } = await executeMutation({
      variables: { input: { email } },
    });

    expect(data?.updateMe?.__typename === "EmailAlreadyTakenError").toBeTruthy();
  });

  it("should update using input", async () => {
    const name = nonEmptyString("foo");
    const email = emailAddress("foo@foo.com");

    const { data } = await executeMutation({
      variables: { input: { name, email } },
    });

    if (data?.updateMe?.__typename !== "UpdateMeSucceeded") {
      fail();
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    const { data } = await executeMutation({
      variables: { input: {} },
    });

    if (data?.updateMe?.__typename !== "UpdateMeSucceeded") {
      fail();
    }

    const after = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    expect(before.name).toBe(after.name);
    expect(before.email).toBe(after.email);
    expect(before.password).toBe(after.password);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    const { data } = await executeMutation({
      variables: { input: { name: nonEmptyString("bar") } },
    });

    if (data?.updateMe?.__typename !== "UpdateMeSucceeded") {
      fail();
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

    if (!data || !data.updateMe || data.updateMe.__typename !== "UpdateMeSucceeded") {
      fail();
    }

    const after = await prisma.user.findUniqueOrThrow({ where: { id: DBData.admin.id } });

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["name", "updatedAt"]);
    const afterToCompare = omit(after, ["name", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
