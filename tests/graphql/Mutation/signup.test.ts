import { client } from "../../../src/db/client.ts";
import { UserRole } from "../../../src/db/generated/types.ts";

import { Data } from "../../data.ts";
import { clearUsers, fail } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { SignupMutation, SignupMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  SignupMutation,
  SignupMutationVariables
>(/* GraphQL */ `
  mutation Signup($name: NonEmptyString!, $email: NonEmptyString!, $password: NonEmptyString!) {
    signup(name: $name, email: $email, password: $password) {
      __typename
      ... on SignupSuccess {
        token
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
};

const seedData = {
  users: () => client.insertInto("User").values(testData.users).execute(),
};

beforeEach(async () => {
  await clearUsers();
  await seedData.users();
});

test("invalid input", async () => {
  const name = "foo";
  const invalidEmail = "emailemail.com";
  const password = "password";

  const { data } = await executeMutation({
    variables: { name, email: invalidEmail, password },
  });

  expect(data?.signup?.__typename === "InvalidInputError").toBe(true);
});

test("email already exists", async () => {
  const name = "foo";
  const { email } = Data.db.admin;
  const password = "password";

  const { data } = await executeMutation({
    variables: { name, email, password },
  });

  expect(data?.signup?.__typename === "EmailAlreadyTakenError").toBe(true);
});

it("should create user using input", async () => {
  const name = "foo";
  const email = "foo@foo.com";
  const password = "password";

  const { data } = await executeMutation({
    variables: { name, email, password },
  });

  if (data?.signup?.__typename !== "SignupSuccess") {
    fail();
  }

  const { token } = data.signup;

  const user = await client
    .selectFrom("User")
    .where("token", "=", token)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.name).toBe(name);
  expect(user.email).toBe(email);
});

test("role should be USER by default", async () => {
  const name = "bar";
  const email = "bar@bar.com";
  const password = "password";

  const { data } = await executeMutation({
    variables: { name, email, password },
  });

  if (data?.signup?.__typename !== "SignupSuccess") {
    fail();
  }

  const { token } = data.signup;

  const user = await client
    .selectFrom("User")
    .where("token", "=", token)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.role).toBe(UserRole.USER);
});
