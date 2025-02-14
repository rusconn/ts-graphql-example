import { client } from "../../../src/db/client.ts";

import { Data } from "../../data.ts";
import { clearUsers, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type {
  LoginPasswordChangeMutation,
  LoginPasswordChangeMutationVariables,
} from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  LoginPasswordChangeMutation,
  LoginPasswordChangeMutationVariables
>(/* GraphQL */ `
  mutation LoginPasswordChange($oldPassword: String!, $newPassword: String!) {
    loginPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {
      __typename
      ... on LoginPasswordChangeSuccess {
        id
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
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { oldPassword: "adminadmin", newPassword: "pass" },
  });

  expect(data?.loginPasswordChange?.__typename === "InvalidInputErrors").toBe(true);
});

test("same passwords", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { oldPassword: "adminadmin", newPassword: "adminadmin" },
  });

  expect(data?.loginPasswordChange?.__typename === "SamePasswordsError").toBe(true);
});

test("incorrect old password", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { oldPassword: "foobar3000", newPassword: "adminadmin2" },
  });

  expect(data?.loginPasswordChange?.__typename === "IncorrectOldPasswordError").toBe(true);
});

it("should change password", async () => {
  const before = await client
    .selectFrom("UserCredential")
    .where("userId", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { oldPassword: "adminadmin", newPassword: "adminadmin2" },
  });

  expect(data?.loginPasswordChange?.__typename === "LoginPasswordChangeSuccess").toBe(true);

  const after = await client
    .selectFrom("UserCredential")
    .where("userId", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.password).not.toBe(after.password);
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("UserCredential")
    .where("userId", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { oldPassword: "adminadmin", newPassword: "adminadmin2" },
  });

  expect(data?.loginPasswordChange?.__typename === "LoginPasswordChangeSuccess").toBe(true);

  const after = await client
    .selectFrom("UserCredential")
    .where("userId", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});
