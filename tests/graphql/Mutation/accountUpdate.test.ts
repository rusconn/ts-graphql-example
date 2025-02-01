import { omit } from "es-toolkit";

import { client } from "../../../src/db/client.ts";

import { Data } from "../../data.ts";
import { clearUsers } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { AccountUpdateMutation, AccountUpdateMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  AccountUpdateMutation,
  AccountUpdateMutationVariables
>(/* GraphQL */ `
  mutation AccountUpdate($name: NonEmptyString, $email: NonEmptyString, $password: NonEmptyString) {
    accountUpdate(name: $name, email: $email, password: $password) {
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
  const invalidEmail = "emailemail.com";

  const { data } = await executeMutation({
    user: Data.context.admin,
    variables: { email: invalidEmail },
  });

  expect(data?.accountUpdate?.__typename === "InvalidInputError").toBe(true);
});

test("email already exists", async () => {
  const { email } = Data.db.alice;

  const { data } = await executeMutation({
    user: Data.context.admin,
    variables: { email },
  });

  expect(data?.accountUpdate?.__typename === "EmailAlreadyTakenError").toBe(true);
});

it("should update using input", async () => {
  const name = "foo";
  const email = "foo@foo.com";

  const { data } = await executeMutation({
    user: Data.context.admin,
    variables: { name, email },
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const user = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.name).toBe(name);
  expect(user.email).toBe(email);
});

it("should not update fields if the field is absent", async () => {
  const before = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    user: Data.context.admin,
    variables: {},
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
  expect(before.password).toBe(after.password);
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    user: Data.context.admin,
    variables: { name: "bar" },
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    user: Data.context.admin,
    variables: { name: "baz" },
  });

  expect(data?.accountUpdate?.__typename === "AccountUpdateSuccess").toBe(true);

  const after = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["name", "updatedAt"]);
  const afterToCompare = omit(after, ["name", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
