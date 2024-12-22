import { db } from "../../../../src/db/client.ts";
import { parseUserNodeId } from "../../../../src/modules/user/parsers/id.ts";

import { Data } from "../../../data.ts";
import { clearUsers, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { DeleteAccountMutation, DeleteAccountMutationVariables } from "../../schema.ts";

const executeMutation = executeSingleResultOperation<
  DeleteAccountMutation,
  DeleteAccountMutationVariables
>(/* GraphQL */ `
  mutation DeleteAccount {
    deleteAccount {
      __typename
      ... on DeleteAccountSuccess {
        id
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo],
};

const seedData = {
  users: () => db.insertInto("User").values(testData.users).execute(),
  todos: () => db.insertInto("Todo").values(testData.todos).execute(),
};

beforeEach(async () => {
  await clearUsers();
  await seedData.users();
});

it("should delete user", async () => {
  const { data } = await executeMutation({});

  if (!data || !data.deleteAccount || data.deleteAccount.__typename !== "DeleteAccountSuccess") {
    fail();
  }

  const id = parseUserNodeId(data.deleteAccount.id);

  if (id instanceof Error) {
    fail();
  }

  const user = await db.selectFrom("User").where("id", "=", id).selectAll().executeTakeFirst();

  expect(user).toBeUndefined();
});

it("should not delete others", async () => {
  const before = await db
    .selectFrom("User")
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({});

  if (!data || !data.deleteAccount || data.deleteAccount.__typename !== "DeleteAccountSuccess") {
    fail();
  }

  const id = parseUserNodeId(data.deleteAccount.id);

  if (id instanceof Error) {
    fail();
  }

  const user = await db.selectFrom("User").where("id", "=", id).selectAll().executeTakeFirst();

  const after = await db
    .selectFrom("User")
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  const beforeCount = Number(before.count);
  const afterCount = Number(after.count);

  expect(user).toBeUndefined();
  expect(afterCount).toBe(beforeCount - 1);
});

it("should delete his resources", async () => {
  await seedData.todos();

  const before = await db
    .selectFrom("Todo")
    .where("userId", "=", Data.db.admin.id)
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({});

  expect(data?.deleteAccount?.__typename === "DeleteAccountSuccess").toBe(true);

  const after = await db
    .selectFrom("Todo")
    .where("userId", "=", Data.db.admin.id)
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  expect(before.count).not.toBe("0");
  expect(after.count).toBe("0");
});
