import { client } from "../../../src/db/client.ts";

import { db, tokens } from "../../data.ts";
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
    variables: { oldPassword: "adminadmin", newPassword: "pass" },
  });

  expect(data?.loginPasswordChange?.__typename).toBe("InvalidInputErrors");
});

test("same passwords", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { oldPassword: "adminadmin", newPassword: "adminadmin" },
  });

  expect(data?.loginPasswordChange?.__typename).toBe("SamePasswordsError");
});

test("incorrect old password", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { oldPassword: "foobar3000", newPassword: "adminadmin2" },
  });

  expect(data?.loginPasswordChange?.__typename).toBe("IncorrectOldPasswordError");
});

it("should change password", async () => {
  const before = await client
    .selectFrom("userCredentials")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { oldPassword: "adminadmin", newPassword: "adminadmin2" },
  });

  expect(data?.loginPasswordChange?.__typename).toBe("LoginPasswordChangeSuccess");

  const after = await client
    .selectFrom("userCredentials")
    .where("userId", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.password).not.toBe(after.password);
});
