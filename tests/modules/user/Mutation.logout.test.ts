import type { LogoutMutation, LogoutMutationVariables } from "tests/modules/schema.js";
import { DBData } from "tests/data/mod.js";
import { clearUsers } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";

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
  users: [DBData.admin, DBData.alice],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeEach(async () => {
  await clearUsers();
  await seedData.users();
});

test("logout deletes token", async () => {
  const before = await prisma.user.findFirstOrThrow({
    where: { id: DBData.admin.id },
  });

  const { data } = await executeMutation({});

  expect(data?.logout?.__typename).toBe("LogoutSuccess");

  const after = await prisma.user.findFirstOrThrow({
    where: { id: DBData.admin.id },
  });

  expect(before.token).not.toBeNull();
  expect(after.token).toBeNull();
});

test("logout does not changes other attrs", async () => {
  const before = await prisma.user.findFirstOrThrow({
    where: { id: DBData.admin.id },
  });

  const { data } = await executeMutation({});

  expect(data?.logout?.__typename).toBe("LogoutSuccess");

  const after = await prisma.user.findFirstOrThrow({
    where: { id: DBData.admin.id },
  });

  expect(before.id).toBe(after.id);
  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
});
