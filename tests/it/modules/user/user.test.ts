import type { UserQuery, UserQueryVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as Graph from "@/modules/common/schema";

const users = [DBData.admin, DBData.alice, DBData.bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = /* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) {
      id
    }
  }
`;

const executeQuery = executeSingleResultOperation(query)<UserQuery, UserQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  const allowedPatterns = [
    [ContextData.admin, GraphData.admin],
    [ContextData.admin, GraphData.alice],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.alice, GraphData.admin],
    [ContextData.alice, GraphData.alice],
    [ContextData.alice, GraphData.bob],
    [ContextData.guest, GraphData.admin],
    [ContextData.guest, GraphData.alice],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeQuery({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeQuery({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(GraphData.validUserIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.user).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.admin.id },
    });

    if (!data || !data.user) {
      fail();
    }

    expect(data.user.id).toEqual(GraphData.admin.id);
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.admin.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });
});
