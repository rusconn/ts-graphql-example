import { describe, test, expect, beforeAll } from "vitest";

import type { UserIdQuery, UserIdQueryVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearTables, fail } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation<UserIdQuery, UserIdQueryVariables>(/* GraphQL */ `
  query UserId($id: ID!) {
    node(id: $id) {
      __typename
      id
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice],
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
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.alice.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.admin.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("logic", () => {
  test("not exists", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.admin.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });

  test("exists, owned", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.admin.id },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.id).toBe(GraphData.admin.id);
  });

  test("exists, but not owned", async () => {
    const { data } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.admin.id },
    });

    expect(data?.node).toBeNull();
  });
});
