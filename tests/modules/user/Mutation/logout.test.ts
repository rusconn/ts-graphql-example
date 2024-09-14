import { db } from "@/db/client.ts";

import { Data } from "tests/data.ts";
import { clearUsers } from "tests/helpers.ts";
import type { LogoutMutation, LogoutMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeMutation = executeSingleResultOperation<
  LogoutMutation,
  LogoutMutationVariables
>(/* GraphQL */ `
  mutation Logout {
    logout {
      __typename
      ... on LogoutSuccess {
        user {
          id
          name
          email
          token
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

test("logout deletes token", async () => {
  const before = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({});

  expect(data?.logout?.__typename).toBe("LogoutSuccess");

  const after = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.token).not.toBeNull();
  expect(after.token).toBeNull();
});

test("logout does not changes other attrs", async () => {
  const before = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({});

  expect(data?.logout?.__typename).toBe("LogoutSuccess");

  const after = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.id).toBe(after.id);
  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
});
