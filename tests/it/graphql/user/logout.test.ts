import type { LogoutMutation, LogoutMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearUsers } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const resetUsers = async () => {
  await clearUsers();
  await seedUsers();
};

const query = /* GraphQL */ `
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
`;

const executeMutation = executeSingleResultOperation(query)<
  LogoutMutation,
  LogoutMutationVariables
>;

beforeAll(resetUsers);

describe("authorization", () => {
  const alloweds = [ContextData.admin, ContextData.alice];
  const notAlloweds = [ContextData.guest];

  test.each(alloweds)("allowed %o", async user => {
    const { errors } = await executeMutation({
      user,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async user => {
    const { errors } = await executeMutation({
      user,
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
