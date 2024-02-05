import { prisma } from "@/prisma/mod.ts";
import * as Prisma from "@/prisma/mod.ts";

import { ContextData, DBData } from "tests/data.ts";
import { clearUsers, fail } from "tests/helpers.ts";
import type { SignupMutation, SignupMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeMutation = executeSingleResultOperation<
  SignupMutation,
  SignupMutationVariables
>(/* GraphQL */ `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      __typename
      ... on SignupSuccess {
        token
      }
      ... on EmailAlreadyTakenError {
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

  const { token } = data.signup;

  const user = await prisma.user.findUniqueOrThrow({
    where: { token },
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

  const { token } = data.signup;

  const user = await prisma.user.findUniqueOrThrow({
    where: { token },
  });

  expect(user.role).toBe(Prisma.UserRole.USER);
});
