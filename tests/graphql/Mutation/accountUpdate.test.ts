import { omit } from "es-toolkit";

import { client } from "../../../src/db/client.ts";

import { db, tokens } from "../../data.ts";
import { clearUsers, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { AccountUpdateMutation, AccountUpdateMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  AccountUpdateMutation,
  AccountUpdateMutationVariables
>(/* GraphQL */ `
  mutation AccountUpdate($name: String) {
    accountUpdate(name: $name) {
      __typename
      ... on AccountUpdateSuccess {
        user {
          id
          name
          email
          updatedAt
        }
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
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { name: "" },
  });

  expect(data?.accountUpdate?.__typename === "InvalidInputErrors").toBe(true);
});

it("should update using input", async () => {
  const name = "foo";

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { name },
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const user = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.name).toBe(name);
});

it("should not update fields if the field is absent", async () => {
  const before = await client
    .selectFrom("users")
    .where("users.id", "=", db.users.admin.id)
    .select(["name"])
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: {},
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("users")
    .where("users.id", "=", db.users.admin.id)
    .select(["name"])
    .executeTakeFirstOrThrow();

  expect(before.name).toBe(after.name);
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { name: "bar" },
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { name: "baz" },
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["name", "updatedAt"]);
  const afterToCompare = omit(after, ["name", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
