import type { UserQuery, UserQueryVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearTables } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation<UserQuery, UserQueryVariables>(/* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) {
      id
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

describe("authorization", () => {
  test("not AuthorizationError -> not Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.admin,
      variables: { id: GraphData.alice.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.alice.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  test("not ParseError -> not BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.validUserIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.invalidUserIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.user).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
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
