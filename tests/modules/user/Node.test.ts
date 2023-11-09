import type { UserNodeQuery, UserNodeQueryVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearTables } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation(/* GraphQL */ `
  query UserNode($id: ID!, $includeToken: Boolean = false) {
    node(id: $id) {
      __typename
      id
      ... on User {
        createdAt
        updatedAt
        name
        email
        token @include(if: $includeToken)
      }
    }
  }
`)<UserNodeQuery, UserNodeQueryVariables>;

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
  const allowedPatterns = [
    [ContextData.admin, GraphData.admin.id, { includeToken: true }],
    [ContextData.alice, GraphData.alice.id, { includeToken: true }],
    [ContextData.admin, GraphData.alice.id, {}],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.admin, GraphData.alice.id, { includeToken: true }],
    [ContextData.alice, GraphData.admin.id, {}],
    [ContextData.guest, GraphData.admin.id, {}],
    [ContextData.guest, GraphData.alice.id, {}],
  ] as const;

  test.each(allowedPatterns)("allowed %o %s %o", async (user, id, options) => {
    const { errors } = await executeQuery({
      user,
      variables: { id, ...options },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %s %o", async (user, id, options) => {
    const { errors } = await executeQuery({
      user,
      variables: { id, ...options },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("logic", () => {
  test("not exists", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });

  test("exists, owned", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.admin.id, includeToken: true },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.id).toBe(GraphData.admin.id);
    expect(data.node.createdAt).toEqual(GraphData.admin.createdAt);
    expect(data.node.updatedAt).toEqual(GraphData.admin.updatedAt);
    expect(data.node.name).toBe(GraphData.admin.name);
    expect(data.node.email).toBe(GraphData.admin.email);
    expect(data.node.token).toBe(GraphData.admin.token);
  });

  test("exists, but not owned", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.alice.id, includeToken: true },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.id).toBe(GraphData.alice.id);
    expect(data.node.createdAt).toEqual(GraphData.alice.createdAt);
    expect(data.node.updatedAt).toEqual(GraphData.alice.updatedAt);
    expect(data.node.name).toEqual(GraphData.alice.name);
    expect(data.node.email).toEqual(GraphData.alice.email);
    expect(data.node.token).toBeNull();
  });
});
