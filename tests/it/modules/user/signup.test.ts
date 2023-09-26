import type { SignupMutation, SignupMutationVariables } from "it/modules/schema";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearUsers } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as DataSource from "@/datasources";
import * as Graph from "@/modules/common/schema";
import { parseUserNodeId } from "@/modules/user/parsers";

const executeMutation = executeSingleResultOperation(/* GraphQL */ `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      __typename
      ... on SignupSuccess {
        id
      }
      ... on EmailAlreadyTakenError {
        message
      }
    }
  }
`)<SignupMutation, SignupMutationVariables>;

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

const resetUsers = async () => {
  await clearUsers();
  await seedData.users();
};

beforeAll(resetUsers);

describe("authorization", () => {
  const variables = {
    input: {
      name: "foo",
      email: "guest@guest.com",
      password: "password",
    },
  };

  const alloweds = [ContextData.guest];
  const notAlloweds = [ContextData.admin, ContextData.alice, ContextData.bob];

  test.each(alloweds)("allowed %o", async user => {
    const { data, errors } = await executeMutation({
      user,
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.signup).not.toBeNull();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async user => {
    const { data, errors } = await executeMutation({
      user,
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.signup).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$input", () => {
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

    test.each(valids)("valid %s", async input => {
      const { errors } = await executeMutation({
        user: ContextData.guest,
        variables: { input },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async input => {
      const { errors } = await executeMutation({
        user: ContextData.guest,
        variables: { input },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(resetUsers);

  test("email already exists", async () => {
    const name = "foo";
    const { email } = DBData.admin;
    const password = "password";

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    expect(data?.signup?.__typename).toBe("EmailAlreadyTakenError");
  });

  it("should create user using input", async () => {
    const name = "foo";
    const email = "foo@foo.com";
    const password = "password";

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    if (data?.signup?.__typename !== "SignupSuccess") {
      fail();
    }

    const id = parseUserNodeId(data.signup.id);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });

    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
  });

  test("role should be USER by default", async () => {
    const name = "bar";
    const email = "bar@bar.com";
    const password = "password";

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    if (data?.signup?.__typename !== "SignupSuccess") {
      fail();
    }

    const id = parseUserNodeId(data.signup.id);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });

    expect(user.role).toBe(DataSource.Role.USER);
  });
});
