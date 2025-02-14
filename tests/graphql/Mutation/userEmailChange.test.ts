import { client } from "../../../src/db/client.ts";

import { Data } from "../../data.ts";
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
    variables: { email: "example.com" },
  });

  expect(data?.userEmailChange?.__typename === "InvalidInputErrors").toBe(true);
});

test("email already exists", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email: Data.db.alice.email },
  });

  expect(data?.userEmailChange?.__typename === "EmailAlreadyTakenError").toBe(true);
});

it("should change email", async () => {
  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email: "admin2@admin.com" },
  });

  expect(data?.userEmailChange?.__typename === "UserEmailChangeSuccess").toBe(true);

  const user = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(user.email).toBe("admin2@admin.com");
});

it("should update updatedAt", async () => {
  const before = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    token: Data.token.admin,
    variables: { email: "admin2@admin.com" },
  });

  expect(data?.userEmailChange?.__typename === "UserEmailChangeSuccess").toBe(true);

  const after = await client
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});
