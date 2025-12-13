import { maxRefreshTokens } from "../../../src/config/token.ts";
import { client } from "../../../src/db/client.ts";

import { db, tokens } from "../../data.ts";
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
  users: [db.users.admin, db.users.alice],
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
    token: tokens.admin,
    variables: { email: invalidEmail, password },
  });

  expect(data?.login?.__typename === "InvalidInputErrors").toBe(true);
});

test("wrong email", async () => {
  const wrongEmail = db.users.admin.email.slice(1);
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email: wrongEmail, password },
  });

  expect(data?.login?.__typename === "LoginFailedError").toBe(true);
});

test("wrong password", async () => {
  const { email } = db.users.admin;
  const wrongPassword = "dminadmin";

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email, password: wrongPassword },
  });

  expect(data?.login?.__typename === "LoginFailedError").toBe(true);
});

test("correct input", async () => {
  const { email } = db.users.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email, password },
  });

  expect(data?.login?.__typename === "LoginSuccess").toBe(true);
});

test("login adds a token", async () => {
  const before = await client
    .selectFrom("userTokens")
    .where("userId", "=", db.users.admin.id)
    .select("refreshToken")
    .execute();

  const { email } = db.users.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email, password },
  });

  expect(data?.login?.__typename === "LoginSuccess").toBe(true);

  const after = await client
    .selectFrom("userTokens")
    .where("userId", "=", db.users.admin.id)
    .select("refreshToken")
    .execute();

  expect(after.length).toBe(before.length + 1);
});

test("num tokens is limit by config", async () => {
  const { id, email } = db.users.admin;
  const password = "adminadmin";

  const rows = Array.from({ length: maxRefreshTokens - 1 }).map((_, i) => ({
    refreshToken: `dummy-${i}`,
    userId: id,
    lastUsedAt: new Date(),
  }));

  await client
    .insertInto("userTokens") //
    .values(rows)
    .executeTakeFirstOrThrow();

  const before = await client
    .selectFrom("userTokens")
    .where("userId", "=", id)
    .select("refreshToken")
    .execute();

  expect(before.length).toBe(maxRefreshTokens);

  await executeMutation({
    token: tokens.admin,
    variables: { email, password },
  });

  const after = await client
    .selectFrom("userTokens")
    .where("userId", "=", db.users.admin.id)
    .select("refreshToken")
    .execute();

  expect(after.length).toBe(maxRefreshTokens);
});

test("oldest token will be removed when num tokens exceeds the limit", async () => {
  const { id, email, refreshToken } = db.users.admin;
  const password = "adminadmin";

  const before = await client
    .selectFrom("userTokens")
    .where("refreshToken", "=", refreshToken)
    .select("refreshToken")
    .executeTakeFirst();

  expect(before != null).toBe(true);

  const rows = Array.from({ length: maxRefreshTokens - 1 }).map((_, i) => ({
    refreshToken: `dummy-${i}`,
    userId: id,
    lastUsedAt: new Date(),
  }));

  await client
    .insertInto("userTokens") //
    .values(rows)
    .executeTakeFirstOrThrow();

  await executeMutation({
    token: tokens.admin,
    variables: { email, password },
  });

  const after = await client
    .selectFrom("userTokens")
    .where("refreshToken", "=", refreshToken)
    .select("refreshToken")
    .executeTakeFirst();

  expect(after == null).toBe(true);
});

test("login does not changes other attrs", async () => {
  const before = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { email } = db.users.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email, password },
  });

  expect(data?.login?.__typename === "LoginSuccess").toBe(true);

  const after = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.id).toBe(after.id);
  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
});
