import { ErrorCode } from "@/modules/common/schema.ts";
import { prisma } from "@/prisma/mod.ts";

import { ContextData, DBData, GraphData, invalidNodeIds, validNodeIds } from "tests/data.ts";
import { clearTables } from "tests/helpers.ts";
import type { NodeQuery, NodeQueryVariables } from "tests/modules/schema.ts";
import { executeSingleResultOperation } from "tests/server.ts";

const executeQuery = executeSingleResultOperation<NodeQuery, NodeQueryVariables>(/* GraphQL */ `
  query Node($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

const testData = {
  users: [DBData.admin],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

describe("error handling", () => {
  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeQuery({
      variables: { id: GraphData.admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.guest,
      variables: { id: GraphData.admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeQuery({
      variables: { id: validNodeIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: invalidNodeIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
  });
});
