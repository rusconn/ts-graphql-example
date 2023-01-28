import { gql } from "graphql-tag";

import type { LogoutMutation, LogoutMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = gql`
  mutation Logout {
    logout {
      user {
        id
        name
        email
        token
      }
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  LogoutMutation,
  LogoutMutationVariables
>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
  });

  const alloweds = [ContextData.admin, ContextData.alice];
  const notAlloweds = [ContextData.guest];

  test.each(alloweds)("allowed %o", async user => {
    const { errors } = await executeMutation({ user });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async user => {
    const { data, errors } = await executeMutation({ user });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.logout).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
  });

  test("logout deletes token", async () => {
    const before = await prisma.user.findFirstOrThrow({ where: { id: DBData.admin.id } });

    const { data } = await executeMutation({});

    if (!data || !data.logout || !data.logout.user) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findFirstOrThrow({ where: { id: DBData.admin.id } });

    expect(before.token).not.toBeNull();
    expect(after.token).toBeNull();
  });

  test("logout does not changes other attrs", async () => {
    const before = await prisma.user.findFirstOrThrow({ where: { id: DBData.admin.id } });

    const { data } = await executeMutation({});

    if (!data || !data.logout || !data.logout.user) {
      throw new Error("operation failed");
    }

    const after = await prisma.user.findFirstOrThrow({ where: { id: DBData.admin.id } });

    expect(before.id).toBe(after.id);
    expect(before.name).toBe(after.name);
    expect(before.email).toBe(after.email);
  });
});
