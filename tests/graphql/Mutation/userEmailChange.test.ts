import { client } from "../../../src/db/client.ts";

import { db, tokens } from "../../data.ts";
import { clearUsers, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { UserEmailChangeMutation, UserEmailChangeMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  UserEmailChangeMutation,
  UserEmailChangeMutationVariables
>(/* GraphQL */ `
  mutation UserEmailChange($email: String!) {
    userEmailChange(email: $email) {
      __typename
      ... on UserEmailChangeSuccess {
        user {
          id
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
    variables: { email: "example.com" },
  });

  expect(data?.userEmailChange?.__typename).toBe("InvalidInputErrors");
});

test("email already exists", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email: db.users.alice.email },
  });

  expect(data?.userEmailChange?.__typename).toBe("EmailAlreadyTakenError");
});

it("should change email", async () => {
  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email: "admin2@admin.com" },
  });

  expect(data?.userEmailChange?.__typename).toBe("UserEmailChangeSuccess");

  const user = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.email).toBe("admin2@admin.com");
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: tokens.admin,
    variables: { email: "admin2@admin.com" },
  });

  expect(data?.userEmailChange?.__typename).toBe("UserEmailChangeSuccess");

  const after = await client
    .selectFrom("users")
    .where("id", "=", db.users.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});
