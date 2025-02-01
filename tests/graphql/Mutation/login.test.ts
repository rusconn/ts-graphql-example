import { client } from "../../../src/db/client.ts";

import { Data } from "../../data.ts";
import { clearUsers, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { LoginMutation, LoginMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  LoginMutation,
  LoginMutationVariables
>(/* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      __typename
      ... on LoginSuccess {
        token
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
};

const seedData = {
  users: () => seed.user(testData.users),
};

beforeEach(async () => {
  await clearUsers();
  await seedData.users();
});

test("invalid input", async () => {
  const invalidEmail = "emailemail.com";
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email: invalidEmail, password },
  });

  expect(data?.login?.__typename === "InvalidInputErrors").toBe(true);
});

test("wrong email", async () => {
  const wrongEmail = Data.db.admin.email.slice(1);
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email: wrongEmail, password },
  });

  expect(data?.login?.__typename === "LoginFailedError").toBe(true);
});

test("wrong password", async () => {
  const { email } = Data.db.admin;
  const wrongPassword = "dminadmin";

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email, password: wrongPassword },
  });

  expect(data?.login?.__typename === "LoginFailedError").toBe(true);
});

test("correct input", async () => {
  const { email } = Data.db.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email, password },
  });

  expect(data?.login?.__typename === "LoginSuccess").toBe(true);
});

test("login changes token", async () => {
  const before = await client
    .selectFrom("UserToken")
    .where("userId", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { email } = Data.db.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email, password },
  });

  expect(data?.login?.__typename === "LoginSuccess").toBe(true);

  const after = await client
    .selectFrom("UserToken")
    .where("userId", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.token).not.toBe(after.token);
});

test("login does not changes other attrs", async () => {
  const before = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { email } = Data.db.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email, password },
  });

  expect(data?.login?.__typename === "LoginSuccess").toBe(true);

  const after = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.id).toBe(after.id);
  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
});
