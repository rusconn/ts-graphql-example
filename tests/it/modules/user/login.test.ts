import type { LoginMutation, LoginMutationVariables } from "it/modules/schema";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearUsers } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as Graph from "@/modules/common/schema";
import { emailAddress, nonEmptyString } from "@/modules/scalar/parsers";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = /* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      __typename
      ... on LoginSuccess {
        user {
          id
          name
          email
          token
        }
      }
      ... on UserNotFoundError {
        message
      }
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<LoginMutation, LoginMutationVariables>;

beforeAll(async () => {
  await clearUsers();
  await seedUsers();
});

describe("authorization", () => {
  const variables = {
    input: {
      email: emailAddress("email@email.com"),
      password: nonEmptyString("password"),
    },
  };

  const alloweds = [ContextData.admin, ContextData.alice, ContextData.guest];

  test.each(alloweds)("allowed %o", async user => {
    const { errors } = await executeMutation({
      user,
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$input", () => {
    const emailMaxCharacters = 100;
    const passwordMinCharacters = 8;
    const passwordMaxCharacters = 50;

    const valids = [
      { email: `${"a".repeat(emailMaxCharacters - 5)}@a.jp`, password: "password" },
      { email: "email@email.com", password: "a".repeat(passwordMinCharacters) },
      { email: "email@email.com", password: "a".repeat(passwordMaxCharacters) },
    ];

    const invalids = [
      {
        email: `${"a".repeat(emailMaxCharacters - 5 + 1)}@a.jp`,
        password: "password",
      },
      { email: "email@email.com", password: "a".repeat(passwordMinCharacters - 1) },
      { email: "email@email.com", password: "a".repeat(passwordMaxCharacters + 1) },
    ];

    test.each(valids)("valid %s", async ({ email, password }) => {
      const { errors } = await executeMutation({
        user: ContextData.guest,
        variables: {
          input: {
            email: emailAddress(email),
            password: nonEmptyString(password),
          },
        },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async ({ email, password }) => {
      const { errors } = await executeMutation({
        user: ContextData.guest,
        variables: {
          input: {
            email: emailAddress(email),
            password: nonEmptyString(password),
          },
        },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  test("wrong email", async () => {
    const wrongEmail = emailAddress(DBData.admin.email.slice(1));
    const password = nonEmptyString("adminadmin");

    const { data } = await executeMutation({
      variables: { input: { email: wrongEmail, password } },
    });

    expect(data?.login?.__typename).toBe("UserNotFoundError");
  });

  test("wrong password", async () => {
    const email = emailAddress(DBData.admin.email);
    const wrongPassword = nonEmptyString("dminadmin");

    const { data } = await executeMutation({
      variables: { input: { email, password: wrongPassword } },
    });

    expect(data?.login?.__typename).toBe("UserNotFoundError");
  });

  test("correct input", async () => {
    const email = emailAddress(DBData.admin.email);
    const password = nonEmptyString("adminadmin");

    const { data } = await executeMutation({
      variables: { input: { email, password } },
    });

    expect(data?.login?.__typename).toBe("LoginSuccess");
  });

  test("login changes token", async () => {
    const before = await prisma.user.findFirstOrThrow({
      where: { id: DBData.admin.id },
    });

    const email = emailAddress(DBData.admin.email);
    const password = nonEmptyString("adminadmin");

    const { data } = await executeMutation({
      variables: { input: { email, password } },
    });

    expect(data?.login?.__typename).toBe("LoginSuccess");

    const after = await prisma.user.findFirstOrThrow({
      where: { id: DBData.admin.id },
    });

    expect(before.id).toBe(after.id);
    expect(before.name).toBe(after.name);
    expect(before.email).toBe(after.email);
    expect(before.token).not.toBe(after.token);
  });

  test("login does not changes other attrs", async () => {
    const before = await prisma.user.findFirstOrThrow({
      where: { id: DBData.admin.id },
    });

    const email = emailAddress(DBData.admin.email);
    const password = nonEmptyString("adminadmin");

    const { data } = await executeMutation({
      variables: { input: { email, password } },
    });

    expect(data?.login?.__typename).toBe("LoginSuccess");

    const after = await prisma.user.findFirstOrThrow({
      where: { id: DBData.admin.id },
    });

    expect(before.id).toBe(after.id);
    expect(before.name).toBe(after.name);
    expect(before.email).toBe(after.email);
  });
});
