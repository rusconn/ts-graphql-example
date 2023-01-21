import { gql } from "graphql-tag";

import type { MyTodoQuery, MyTodoQueryVariables } from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
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
  query MyTodo($id: ID!, $includeUser: Boolean = false) {
    myTodo(id: $id) {
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
        token
      }
    }
  }
`;

const executeQuery = executeSingleResultOperation(query)<MyTodoQuery, MyTodoQueryVariables>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

describe("authorization", () => {
  const allowedPatterns = [
    [ContextData.admin, GraphData.adminTodo1],
    [ContextData.admin, GraphData.aliceTodo],
    [ContextData.alice, GraphData.adminTodo1],
    [ContextData.alice, GraphData.aliceTodo],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.guest, GraphData.adminTodo1],
    [ContextData.guest, GraphData.aliceTodo],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { errors } = await executeQuery({ user, variables: { id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeQuery({ user, variables: { id } });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.myTodo).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(GraphData.validTodoIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.myTodo).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidTodoIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.myTodo).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  test("not exists", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.myTodo).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });

  test("exists, but not owned", async () => {
    const { data, errors } = await executeQuery({
      variables: { id: GraphData.aliceTodo.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.myTodo).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.NotFound]));
  });

  it("should return item correctly", async () => {
    const { data } = await executeQuery({ variables: { id: GraphData.adminTodo1.id } });

    expect(data?.myTodo).toEqual(GraphData.adminTodo1);
  });
});

describe("query other nodes: user", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.adminTodo1.id, includeUser: true },
    });

    expect(data?.myTodo?.user).toEqual(GraphData.admin);
  });
});
