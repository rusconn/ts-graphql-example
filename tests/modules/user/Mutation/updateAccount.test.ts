import { omit } from "es-toolkit";

import { db } from "../../../../src/db/client.ts";

import { Data } from "../../../data.ts";
import { clearUsers } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { UpdateAccountMutation, UpdateAccountMutationVariables } from "../../schema.ts";

const executeMutation = executeSingleResultOperation<
  UpdateAccountMutation,
  UpdateAccountMutationVariables
>(/* GraphQL */ `
  mutation UpdateAccount($name: NonEmptyString, $email: NonEmptyString, $password: NonEmptyString) {
    updateAccount(name: $name, email: $email, password: $password) {
      __typename
      ... on UpdateAccountSuccess {
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
  users: () => db.insertInto("User").values(testData.users).execute(),
};

beforeEach(async () => {
  await clearUsers();
  await seedData.users();
});

test("invalid input", async () => {
  const invalidEmail = "emailemail.com";

  const { data } = await executeMutation({
    variables: { email: invalidEmail },
  });

  expect(data?.updateAccount?.__typename === "InvalidInputError").toBe(true);
});

test("email already exists", async () => {
  const { email } = Data.db.alice;

  const { data } = await executeMutation({
    variables: { email },
  });

  expect(data?.updateAccount?.__typename === "EmailAlreadyTakenError").toBe(true);
});

it("should update using input", async () => {
  const name = "foo";
  const email = "foo@foo.com";

  const { data } = await executeMutation({
    variables: { name, email },
  });

  expect(data?.updateAccount?.__typename === "UpdateAccountSuccess").toBe(true);

  const user = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.name).toBe(name);
  expect(user.email).toBe(email);
});

it("should not update fields if the field is absent", async () => {
  const before = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: {},
  });

  expect(data?.updateAccount?.__typename === "UpdateAccountSuccess").toBe(true);

  const after = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
  expect(before.password).toBe(after.password);
});

it("should update updatedAt", async () => {
  const before = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { name: "bar" },
  });

  expect(data?.updateAccount?.__typename === "UpdateAccountSuccess").toBe(true);

  const after = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { name: "baz" },
  });

  expect(data?.updateAccount?.__typename === "UpdateAccountSuccess").toBe(true);

  const after = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["name", "updatedAt"]);
  const afterToCompare = omit(after, ["name", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
