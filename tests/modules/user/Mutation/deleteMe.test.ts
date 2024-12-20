import { db } from "../../../../src/db/client.ts";
import { parseUserNodeId } from "../../../../src/modules/user/common/parser.ts";

import { Data } from "../../../data.ts";
import { clearUsers, fail } from "../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type { DeleteMeMutation, DeleteMeMutationVariables } from "../../schema.ts";

const executeMutation = executeSingleResultOperation<
  DeleteMeMutation,
  DeleteMeMutationVariables
>(/* GraphQL */ `
  mutation DeleteMe {
    deleteMe {
      __typename
      ... on DeleteMeSuccess {
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

  if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSuccess") {
    fail();
  }

  const id = parseUserNodeId(data.deleteMe.id);

  const user = await db.selectFrom("User").where("id", "=", id).selectAll().executeTakeFirst();

  expect(user).toBeUndefined();
});

it("should not delete others", async () => {
  const before = await db
    .selectFrom("User")
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({});

  if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSuccess") {
    fail();
  }

  const id = parseUserNodeId(data.deleteMe.id);

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

  expect(data?.deleteMe?.__typename === "DeleteMeSuccess").toBe(true);

  const after = await db
    .selectFrom("Todo")
    .where("userId", "=", Data.db.admin.id)
    .select(({ fn }) => fn.countAll().as("count"))
    .executeTakeFirstOrThrow();

  expect(before.count).not.toBe("0");
  expect(after.count).toBe("0");
});
