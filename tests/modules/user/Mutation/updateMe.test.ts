import { omit } from "remeda";

import { prisma } from "@/prisma/mod.ts";

import { Data } from "tests/data.ts";
import { clearUsers } from "tests/helpers.ts";
import type { UpdateMeMutation, UpdateMeMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeMutation = executeSingleResultOperation<
  UpdateMeMutation,
  UpdateMeMutationVariables
>(/* GraphQL */ `
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      __typename
      ... on UpdateMeSuccess {
        user {
          id
          name
          email
          updatedAt
        }
      }
      ... on EmailAlreadyTakenError {
        message
      }
    }
  }
`);

const testData = {
  users: [Data.db.admin, Data.db.alice],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeEach(async () => {
  await clearUsers();
  await seedData.users();
});

test("email already exists", async () => {
  const { email } = Data.db.alice;

  const { data } = await executeMutation({
    variables: { input: { email } },
  });

  expect(data?.updateMe?.__typename).toBe("EmailAlreadyTakenError");
});

it("should update using input", async () => {
  const name = "foo";
  const email = "foo@foo.com";

  const { data } = await executeMutation({
    variables: { input: { name, email } },
  });

  expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: Data.db.admin.id },
  });

  expect(user.name).toBe(name);
  expect(user.email).toBe(email);
});

it("should not update fields if the field is absent", async () => {
  const before = await prisma.user.findUniqueOrThrow({
    where: { id: Data.db.admin.id },
  });

  const { data } = await executeMutation({
    variables: { input: {} },
  });

  expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

  const after = await prisma.user.findUniqueOrThrow({
    where: { id: Data.db.admin.id },
  });

  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
  expect(before.password).toBe(after.password);
});

it("should update updatedAt", async () => {
  const before = await prisma.user.findUniqueOrThrow({
    where: { id: Data.db.admin.id },
  });

  const { data } = await executeMutation({
    variables: { input: { name: "bar" } },
  });

  expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

  const after = await prisma.user.findUniqueOrThrow({
    where: { id: Data.db.admin.id },
  });

  const beforeUpdatedAt = before.updatedAt.getTime();
  const afterUpdatedAt = after.updatedAt.getTime();

  expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
});

it("should not update other attrs", async () => {
  const before = await prisma.user.findUniqueOrThrow({
    where: { id: Data.db.admin.id },
  });

  const { data } = await executeMutation({
    variables: { input: { name: "baz" } },
  });

  expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

  const after = await prisma.user.findUniqueOrThrow({
    where: { id: Data.db.admin.id },
  });

  // これらのフィールドは変化する想定
  const beforeToCompare = omit(before, ["name", "updatedAt"]);
  const afterToCompare = omit(after, ["name", "updatedAt"]);

  expect(afterToCompare).toStrictEqual(beforeToCompare);
});
