import { client } from "../../../src/db/client.ts";

import { db, tokens } from "../../data.ts";
import { clearUsers, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { LogoutMutation, LogoutMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  LogoutMutation,
  LogoutMutationVariables
>(/* GraphQL */ `
  mutation Logout {
    logout {
      __typename
      success
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

test("logout deletes specified token", async () => {
  const before = await client
    .selectFrom("userTokens")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirst();

  const { data } = await executeMutation({
    token: tokens.admin,
    refreshToken: "33e9adb5-d716-4388-86a1-6885e6499eec",
  });

  expect(data?.logout?.success).toBe(true);

  const after = await client
    .selectFrom("userTokens")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirst();

  expect(before == null).not.toBe(true);
  expect(after == null).toBe(true);
});

test("allows invalid token", async () => {
  const before = await client
    .selectFrom("userTokens")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirst();

  const { data } = await executeMutation({
    token: tokens.admin,
    refreshToken: "33e9adb5-d716-4388-86a1-6885e6499eec".slice(0, -1),
  });

  expect(data?.logout?.success).toBe(true);

  const after = await client
    .selectFrom("userTokens")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirst();

  expect(before == null).not.toBe(true);
  expect(after == null).not.toBe(true);
});

test("logout does not changes other attrs", async () => {
  const before = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
  });

  expect(data?.logout?.success).toBe(true);

  const after = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.id).toBe(after.id);
  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
});
