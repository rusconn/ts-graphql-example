import { parseUserNodeId } from "@/modules/user/common/parser.ts";
import { prisma } from "@/prisma/mod.ts";

import { Data } from "tests/data.ts";
import { clearUsers, fail } from "tests/helpers.ts";
import type { DeleteMeMutation, DeleteMeMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

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
  users: () => prisma.user.createMany({ data: testData.users }),
  todos: () => prisma.todo.createMany({ data: testData.todos }),
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

  const user = await prisma.user.findUnique({
    where: { id },
  });

  expect(user).toBeNull();
});

it("should not delete others", async () => {
  const before = await prisma.user.count();

  const { data } = await executeMutation({});

  if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSuccess") {
    fail();
  }

  const id = parseUserNodeId(data.deleteMe.id);

  const user = await prisma.user.findUnique({
    where: { id },
  });

  const after = await prisma.user.count();

  expect(user).toBeNull();
  expect(after).toBe(before - 1);
});

it("should delete his resources", async () => {
  await seedData.todos();

  const before = await prisma.todo.count({
    where: { userId: Data.db.admin.id },
  });

  const { data } = await executeMutation({});

  expect(data?.deleteMe?.__typename).toBe("DeleteMeSuccess");

  const after = await prisma.todo.count({
    where: { userId: Data.db.admin.id },
  });

  expect(before).not.toBe(0);
  expect(after).toBe(0);
});
