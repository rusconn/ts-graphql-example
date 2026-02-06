import { client } from "../../../src/db/client.ts";
import { UserRole } from "../../../src/db/types.ts";

import { db } from "../../data.ts";
import { clearUsers, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { SignupMutation, SignupMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  SignupMutation,
  SignupMutationVariables
>(/* GraphQL */ `
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      __typename
      ... on SignupSuccess {
        token
      }
    }
  }
`);

const testData = {
  users: [db.users.admin],
};

const seedData = {
  users: () => seed.user(testData.users),
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

  expect(data?.signup?.__typename).toBe("InvalidInputErrors");
});

test("email already exists", async () => {
  const name = "foo";
  const { email } = db.users.admin;
  const password = "password";

  const { data } = await executeMutation({
    variables: { name, email, password },
  });

  expect(data?.signup?.__typename).toBe("EmailAlreadyTakenError");
});

it("should create user using input", async () => {
  const name = "foo";
  const email = "foo@foo.com";
  const password = "password";

  const { data } = await executeMutation({
    variables: { name, email, password },
  });

  if (data?.signup?.__typename !== "SignupSuccess") {
    assert.fail();
  }

  const user = await client
    .selectFrom("users")
    .where("email", "=", email)
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
    assert.fail();
  }

  const user = await client
    .selectFrom("users")
    .where("email", "=", email)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.role).toBe(UserRole.User);
});
