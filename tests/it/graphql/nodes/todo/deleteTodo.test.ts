import { gql } from "graphql-tag";

import type { DeleteTodoMutation, DeleteTodoMutationVariables } from "it/graphql/types";
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
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      ... on DeleteTodoSucceeded {
        __typename
        id
      }
      ... on TodoNotFoundError {
        __typename
        message
      }
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  DeleteTodoMutation,
  DeleteTodoMutationVariables
>;

describe("authorization", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

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
    const { errors } = await executeMutation({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { errors } = await executeMutation({
      user,
      variables: { id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    beforeEach(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

    test.each(GraphData.validTodoIds)("valid %s", async id => {
      const { errors } = await executeMutation({ variables: { id } });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidTodoIds)("invalid %s", async id => {
      const { errors } = await executeMutation({ variables: { id } });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  test("not exists", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    expect(data?.deleteTodo?.__typename === "TodoNotFoundError").toBeTruthy();
  });

  test("exists, but not owned", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.aliceTodo.id },
    });

    expect(data?.deleteTodo?.__typename === "TodoNotFoundError").toBeTruthy();
  });

  it("should delete todo", async () => {
    const { data } = await executeMutation({ variables: { id: GraphData.adminTodo1.id } });

    if (!data || !data.deleteTodo || data.deleteTodo.__typename !== "DeleteTodoSucceeded") {
      fail();
    }

    const todo = await prisma.todo.findUnique({ where: { id: DBData.adminTodo1.id } });

    expect(todo).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await prisma.todo.count();

    const { data } = await executeMutation({ variables: { id: GraphData.adminTodo1.id } });

    if (!data || !data.deleteTodo || data.deleteTodo.__typename !== "DeleteTodoSucceeded") {
      fail();
    }

    const todo = await prisma.todo.findUnique({ where: { id: DBData.adminTodo1.id } });

    const after = await prisma.todo.count();

    expect(todo).toBeNull();
    expect(after).toBe(before - 1);
  });
});
