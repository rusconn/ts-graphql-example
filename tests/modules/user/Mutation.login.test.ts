import type { LoginMutation, LoginMutationVariables } from "tests/modules/schema.js";
import { ContextData, DBData } from "tests/data/mod.js";
import { clearUsers } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import * as Graph from "@/modules/common/schema.js";

const executeMutation = executeSingleResultOperation<
  LoginMutation,
  LoginMutationVariables
>(/* GraphQL */ `
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
`);

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearUsers();
  await seedData.users();
});

describe("authorization", () => {
  const variables = {
    input: {
      email: "email@email.com",
      password: "password",
    },
  };

  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.alice,
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const passMin = 8;
  const validInput = { email: "email@email.com", password: "password" };

  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { ...validInput } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { ...validInput, password: "A".repeat(passMin - 1) } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await clearUsers();
    await seedData.users();
  });

  test("wrong email", async () => {
    const wrongEmail = DBData.admin.email.slice(1);
    const password = "adminadmin";

    const { data } = await executeMutation({
      variables: { input: { email: wrongEmail, password } },
    });

    expect(data?.login?.__typename).toBe("UserNotFoundError");
  });

  test("wrong password", async () => {
    const { email } = DBData.admin;
    const wrongPassword = "dminadmin";

    const { data } = await executeMutation({
      variables: { input: { email, password: wrongPassword } },
    });

    expect(data?.login?.__typename).toBe("UserNotFoundError");
  });

  test("correct input", async () => {
    const { email } = DBData.admin;
    const password = "adminadmin";

    const { data } = await executeMutation({
      variables: { input: { email, password } },
    });

    expect(data?.login?.__typename).toBe("LoginSuccess");
  });

  test("login changes token", async () => {
    const before = await prisma.user.findFirstOrThrow({
      where: { id: DBData.admin.id },
    });

    const { email } = DBData.admin;
    const password = "adminadmin";

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

    const { email } = DBData.admin;
    const password = "adminadmin";

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
