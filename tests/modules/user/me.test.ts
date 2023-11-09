import type { MeQuery, MeQueryVariables } from "tests/modules/schema";
import { ContextData, DBData } from "tests/data";
import { clearUsers } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation(/* GraphQL */ `
  query Me {
    me {
      id
    }
  }
`)<MeQuery, MeQueryVariables>;

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearUsers();
  await seedData.users();
});

describe("authorization", () => {
  test("not AuthorizationError -> not Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.alice,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.me).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.guest,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.me).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});
