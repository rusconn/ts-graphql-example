import { omit } from "remeda";

import { db } from "@/db/client.ts";
import { TodoStatus } from "@/modules/common/schema.ts";

import { Data } from "tests/data.ts";
import { clearTables } from "tests/helpers.ts";
import type { CompleteTodoMutation, CompleteTodoMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeMutation = executeSingleResultOperation<
  CompleteTodoMutation,
  CompleteTodoMutationVariables
>(/* GraphQL */ `
  mutation CompleteTodo($id: ID!) {
    completeTodo(id: $id) {
      __typename
      ... on CompleteTodoSuccess {
        todo {
          id
          updatedAt
          title
          description
          status
        }
      }
      ... on TodoNotFoundError {
        message
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
  todos: [Data.db.adminTodo, Data.db.aliceTodo],
};

const seedData = {
  users: () => db.insertInto("User").values(testData.users).execute(),
  todos: () => db.insertInto("Todo").values(testData.todos).execute(),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

beforeEach(async () => {
  await db
    .insertInto("Todo")
    .values(Data.db.adminTodo)
    .onConflict((oc) => oc.column("id").doUpdateSet(Data.db.adminTodo))
    .executeTakeFirstOrThrow();
});

test("not exists", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id.slice(0, -1) },
  });

  expect(data?.completeTodo?.__typename).toBe("TodoNotFoundError");
});

test("exists, but not owned", async () => {
  const { data } = await executeMutation({
    variables: { id: Data.graph.aliceTodo.id },
  });

  expect(data?.completeTodo?.__typename).toBe("TodoNotFoundError");
});

it("should update status", async () => {
  const before = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.completeTodo?.__typename).toBe("CompleteTodoSuccess");

  const after = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.status).toBe(TodoStatus.Pending);
  expect(after.status).toBe(TodoStatus.Done);
});

it("should update updatedAt", async () => {
  const before = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.completeTodo?.__typename).toBe("CompleteTodoSuccess");

  const after = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { data } = await executeMutation({
    variables: { id: Data.graph.adminTodo.id },
  });

  expect(data?.completeTodo?.__typename).toBe("CompleteTodoSuccess");

  const after = await db
    .selectFrom("Todo")
    .where("id", "=", Data.db.adminTodo.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["status", "updatedAt"]);
  const afterToCompare = omit(after, ["status", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
