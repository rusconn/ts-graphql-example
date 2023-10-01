import type { NodeQuery, NodeQueryVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation(/* GraphQL */ `
  query Node($id: ID!) {
    node(id: $id) {
      id
    }
  }
`)<NodeQuery, NodeQueryVariables>;

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
  todos: [
    DBData.adminTodo1,
    DBData.adminTodo2,
    DBData.adminTodo3,
    DBData.aliceTodo,
    DBData.bobTodo,
  ],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
  todos: () => prisma.todo.createMany({ data: testData.todos }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

describe("authorization", () => {
  describe("node", () => {
    const allowedPatterns = [
      [ContextData.admin, GraphData.admin],
      [ContextData.admin, GraphData.alice],
      [ContextData.alice, GraphData.alice],
    ] as const;

    const notAllowedPatterns = [
      [ContextData.alice, GraphData.admin],
      [ContextData.guest, GraphData.admin],
      [ContextData.guest, GraphData.alice],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async (user, { id }) => {
      const { errors } = await executeQuery({
        user,
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({
        user,
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeNull();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(GraphData.validNodeIds)("valid %s", async id => {
      const { errors } = await executeQuery({
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
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

  test("exists, but not owned", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.alice.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).not.toBeNull();
    expect(errorCodes).toEqual(expect.not.arrayContaining([Graph.ErrorCode.NotFound]));
  });

  describe("should return item correctly", () => {
    const ids = [GraphData.admin.id, GraphData.adminTodo1.id];

    test.each(ids)("%s", async id => {
      const { data } = await executeQuery({
        variables: { id },
      });

      expect(data?.node?.id).toEqual(id);
    });
  });

  describe("should return not found error if not found", () => {
    const ids = [GraphData.admin.id, GraphData.adminTodo1.id].map(id => id.slice(0, -1));

    test.each(ids)("%s", async id => {
      const { data, errors } = await executeQuery({
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
    });
  });
});
