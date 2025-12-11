import { client } from "../../../src/db/client.ts";
import { parseUserId } from "../../../src/graphql/_parsers/user/id.ts";

import { db, tokens } from "../../data.ts";
import { clearUsers, fail, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { AccountDeleteMutation, AccountDeleteMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  AccountDeleteMutation,
  AccountDeleteMutationVariables
>(/* GraphQL */ `
  mutation AccountDelete {
    accountDelete {
      __typename
      ... on AccountDeleteSuccess {
        id
      }
    }
  }
`);

const testData = {
  users: [db.users.admin, db.users.alice],
  todos: [db.todos.admin1],
};

const seedData = {
  users: () => seed.user(testData.users),
  todos: () => seed.todo(testData.todos),
};

beforeEach(async () => {
  await clearUsers();
  await seedData.users();
});

it("should delete user and user-*", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
  });

  if (!data || !data.accountDelete || data.accountDelete.__typename !== "AccountDeleteSuccess") {
    fail();
  }

  const id = parseUserId(data.accountDelete.id);

  if (id instanceof Error) {
    fail();
  }

  const [user, userCredential, userToken] = await Promise.all([
    client //
      .selectFrom("users")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst(),
    client //
      .selectFrom("userCredentials")
      .where("userId", "=", id)
      .selectAll()
      .executeTakeFirst(),
    client //
      .selectFrom("userTokens")
      .where("userId", "=", id)
      .selectAll()
      .executeTakeFirst(),
  ]);

  expect(user).toBeUndefined();
  expect(userCredential).toBeUndefined();
  expect(userToken).toBeUndefined();
});

it("should not delete others", async () => {
  const before = await client
    .selectFrom("users")
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
  });

  if (!data || !data.accountDelete || data.accountDelete.__typename !== "AccountDeleteSuccess") {
    fail();
  }

  const id = parseUserId(data.accountDelete.id);

  if (id instanceof Error) {
    fail();
  }

  const user = await client
    .selectFrom("users") //
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();

  const after = await client
    .selectFrom("users")
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();

  expect(user).toBeUndefined();
  expect(after.count).toBe(before.count - 1);
});

it("should delete his resources", async () => {
  await seedData.todos();

  const before = await client
    .selectFrom("todos")
    .where("userId", "=", db.users.admin.id)
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
  });

  expect(data?.accountDelete?.__typename === "AccountDeleteSuccess").toBe(true);

  const after = await client
    .selectFrom("todos")
    .where("userId", "=", db.users.admin.id)
    .select(({ fn }) => fn.countAll<number>().as("count"))
    .executeTakeFirstOrThrow();

  expect(before.count).not.toBe(0);
  expect(after.count).toBe(0);
});
