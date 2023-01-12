import { gql } from "graphql-tag";

import type { TodoQuery, TodoQueryVariables } from "it/graphql/types";
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
  query Todo($id: ID!, $includeUser: Boolean = false) {
    todo(id: $id) {
      id
      createdAt
      updatedAt
      title
      description
      status
      user @include(if: $includeUser) {
        id
        createdAt
        updatedAt
        name
        role
        token
      }
    }
  }
`;

const executeQuery = executeSingleResultOperation(query)<TodoQuery, TodoQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

describe("authorization", () => {
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

    expect(data?.todo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
    const { data, errors } = await executeQuery({ user, variables: { id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(GraphData.validTodoIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.todo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidTodoIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.todo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("query without other nodes", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({ variables: { id: GraphData.adminTodo1.id } });

    expect(data?.todo).toEqual(GraphData.adminTodo1);
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.todo).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });
});

describe("query other nodes: user", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id, includeUser: true },
    });

    expect(data?.todo?.user).toEqual(GraphData.admin);
  });
});
