import type { LoginMutation, LoginMutationVariables } from "tests/modules/schema.ts";
import { DBData } from "tests/data.ts";
import { clearUsers } from "tests/helpers.ts";
import { executeSingleResultOperation } from "tests/server.ts";
import { prisma } from "@/prisma/mod.ts";

const executeMutation = executeSingleResultOperation<
  LoginMutation,
  LoginMutationVariables
>(/* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      __typename
      ... on LoginSuccess {
        token
      }
      ... on UserNotFoundError {
        message
      }
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

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
