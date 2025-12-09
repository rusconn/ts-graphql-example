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
      ... on LogoutSuccess {
        id
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

test("logout deletes token", async () => {
  const before = await client
    .selectFrom("UserToken")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirst();

  const { data } = await executeMutation({
    token: tokens.admin,
  });

  expect(data?.logout?.__typename === "LogoutSuccess").toBe(true);

  const after = await client
    .selectFrom("UserToken")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirst();

  expect(before == null).not.toBe(true);
  expect(after == null).toBe(true);
});

test("logout does not changes other attrs", async () => {
  const before = await client
    .selectFrom("User")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
  });

  expect(data?.logout?.__typename === "LogoutSuccess").toBe(true);

  const after = await client
    .selectFrom("User")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.id).toBe(after.id);
  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
});
