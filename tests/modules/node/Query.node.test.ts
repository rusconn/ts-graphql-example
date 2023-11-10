import { describe, test, expect, beforeAll } from "vitest";

import type { NodeQuery, NodeQueryVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearTables } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeQuery = executeSingleResultOperation<NodeQuery, NodeQueryVariables>(/* GraphQL */ `
  query Node($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

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
  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.alice.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { data, errors } = await executeQuery({
      user: ContextData.guest,
      variables: { id: GraphData.alice.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeQuery({
      variables: { id: GraphData.validNodeIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.invalidIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
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
