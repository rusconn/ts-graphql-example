import { gql } from "graphql-tag";
import pick from "lodash/pick";

import type { NodeQuery, NodeQueryVariables } from "it/graphql/types";
import { DBData, GraphData } from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];

const todos = [
  DBData.adminTodo1,
  DBData.adminTodo2,
  DBData.adminTodo3,
  DBData.aliceTodo,
  DBData.bobTodo,
];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  query Node($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
      ... on Todo {
        title
      }
    }
  }
`;

const executeQuery = executeSingleResultOperation(query)<NodeQuery, NodeQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

describe("authorization", () => {
  describe("user", () => {
    const allowedPatterns = [
      [DBData.admin, GraphData.admin],
      [DBData.admin, GraphData.alice],
      [DBData.alice, GraphData.alice],
    ] as const;

    const notAllowedPatterns = [
      [DBData.alice, GraphData.bob],
      [DBData.guest, GraphData.admin],
      [DBData.guest, GraphData.alice],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });
  });

  describe("todo", () => {
    const allowedPatterns = [
      [DBData.admin, GraphData.adminTodo1],
      [DBData.admin, GraphData.aliceTodo],
      [DBData.alice, GraphData.aliceTodo],
    ] as const;

    const notAllowedPatterns = [
      [DBData.alice, GraphData.bobTodo],
      [DBData.guest, GraphData.adminTodo1],
      [DBData.guest, GraphData.aliceTodo],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
    });
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(GraphData.validNodeIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("query user", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({ variables: { id: GraphData.admin.id } });

    expect(data?.node).toEqual({ ...pick(GraphData.admin, ["name"]), id: GraphData.admin.id });
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.admin.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });
});

describe("query todo", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({ variables: { id: GraphData.adminTodo1.id } });

    expect(data?.node).toEqual(pick(GraphData.adminTodo1, ["id", "title"]));
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });
});
