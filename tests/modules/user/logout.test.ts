import type { LogoutMutation, LogoutMutationVariables } from "tests/modules/schema";
import { ContextData, DBData } from "tests/data";
import { clearUsers } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

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
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

const resetUsers = async () => {
  await clearUsers();
  await seedData.users();
};

beforeAll(resetUsers);

describe("authorization", () => {
  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.alice,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("logic", () => {
  beforeEach(resetUsers);

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
});
