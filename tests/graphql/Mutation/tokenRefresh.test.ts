import { client } from "../../../src/db/client.ts";
import { ErrorCode } from "../../../src/schema.ts";

import { db, refreshTokens } from "../../data.ts";
import { clearUsers, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { TokenRefreshMutation, TokenRefreshMutationVariables } from "../schema.ts";

const executeMutation = executeSingleResultOperation<
  TokenRefreshMutation,
  TokenRefreshMutationVariables
>(/* GraphQL */ `
  mutation TokenRefresh {
    tokenRefresh {
      __typename
      ... on TokenRefreshSuccess {
        token
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

test("no refresh token", async () => {
  const { data, errors } = await executeMutation({});

  expect(data?.tokenRefresh === null).toBe(true);
  expect(errors?.map((e) => e.extensions.code)).toStrictEqual([ErrorCode.BadUserInput]);
});

test("invalid refresh token", async () => {
  const { data } = await executeMutation({
    refreshToken: refreshTokens.admin.slice(0, -1),
  });

  expect(data?.tokenRefresh?.__typename === "InvalidRefreshTokenError").toBe(true);
});

test("correct input", async () => {
  const { data } = await executeMutation({
    refreshToken: refreshTokens.admin,
  });

  expect(data?.tokenRefresh?.__typename === "TokenRefreshSuccess").toBe(true);
});

test("update last_used_at", async () => {
  const before = await client
    .selectFrom("userTokens")
    .where("refreshToken", "=", db.users.admin.refreshToken)
    .select("lastUsedAt")
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    refreshToken: refreshTokens.admin,
  });

  expect(data?.tokenRefresh?.__typename === "TokenRefreshSuccess").toBe(true);

  const after = await client
    .selectFrom("userTokens")
    .where("refreshToken", "=", db.users.admin.refreshToken)
    .select("lastUsedAt")
    .executeTakeFirstOrThrow();

  expect(after.lastUsedAt > before.lastUsedAt).toBe(true);
});
