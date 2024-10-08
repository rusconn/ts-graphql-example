import { db } from "@/db/client.ts";

import { Data } from "tests/data.ts";
import { clearUsers } from "tests/helpers.ts";
import type { LoginMutation, LoginMutationVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeMutation = executeSingleResultOperation<
  LoginMutation,
  LoginMutationVariables
>(/* GraphQL */ `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      __typename
      ... on LoginSuccess {
        token
      }
      ... on UserNotFoundError {
        message
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

test("wrong email", async () => {
  const wrongEmail = Data.db.admin.email.slice(1);
  const password = "adminadmin";

  const { data } = await executeMutation({
    variables: { input: { email: wrongEmail, password } },
  });

  expect(data?.login?.__typename).toBe("UserNotFoundError");
});

test("wrong password", async () => {
  const { email } = Data.db.admin;
  const wrongPassword = "dminadmin";

  const { data } = await executeMutation({
    variables: { input: { email, password: wrongPassword } },
  });

  expect(data?.login?.__typename).toBe("UserNotFoundError");
});

test("correct input", async () => {
  const { email } = Data.db.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    variables: { input: { email, password } },
  });

  expect(data?.login?.__typename).toBe("LoginSuccess");
});

test("login changes token", async () => {
  const before = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { email } = Data.db.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    variables: { input: { email, password } },
  });

  expect(data?.login?.__typename).toBe("LoginSuccess");

  const after = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.token).not.toBe(after.token);
});

test("login does not changes other attrs", async () => {
  const before = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  const { email } = Data.db.admin;
  const password = "adminadmin";

  const { data } = await executeMutation({
    variables: { input: { email, password } },
  });

  expect(data?.login?.__typename).toBe("LoginSuccess");

  const after = await db
    .selectFrom("User")
    .where("id", "=", Data.db.admin.id)
    .selectAll()
    .executeTakeFirstOrThrow();

  expect(before.id).toBe(after.id);
  expect(before.name).toBe(after.name);
  expect(before.email).toBe(after.email);
});
