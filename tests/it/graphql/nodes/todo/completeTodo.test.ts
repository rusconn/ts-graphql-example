import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { CompleteTodoMutation, CompleteTodoMutationVariables } from "it/graphql/types";
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

const resetAdminTodoValue = () =>
  prisma.todo.upsert({
    where: { id: DBData.adminTodo1.id },
    create: DBData.adminTodo1,
    update: DBData.adminTodo1,
  });

const query = gql`
  mutation CompleteTodo($id: ID!) {
    completeTodo(id: $id) {
      ... on CompleteTodoSucceeded {
        __typename
        todo {
          id
          updatedAt
          title
          description
          status
        }
      }
      ... on TodoNotFoundError {
        __typename
        message
      }
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  CompleteTodoMutation,
  CompleteTodoMutationVariables
>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

describe("authorization", () => {
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
  beforeEach(resetAdminTodoValue);

  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  test("not exists", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    expect(data?.completeTodo?.__typename === "TodoNotFoundError").toBeTruthy();
  });

  test("exists, but not owned", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.aliceTodo.id },
    });

    expect(data?.completeTodo?.__typename === "TodoNotFoundError").toBeTruthy();
  });

  it("should update status", async () => {
    const before = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const { data } = await executeMutation({ variables: { id: GraphData.adminTodo1.id } });

    if (!data || !data.completeTodo || data.completeTodo.__typename !== "CompleteTodoSucceeded") {
      fail();
    }

    const after = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    expect(before.status).toBe(Graph.TodoStatus.Pending);
    expect(after.status).toBe(Graph.TodoStatus.Done);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const { data } = await executeMutation({ variables: { id: GraphData.adminTodo1.id } });

    if (!data || !data.completeTodo || data.completeTodo.__typename !== "CompleteTodoSucceeded") {
      fail();
    }

    const after = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const { data } = await executeMutation({ variables: { id: GraphData.adminTodo1.id } });

    if (!data || !data.completeTodo || data.completeTodo.__typename !== "CompleteTodoSucceeded") {
      fail();
    }

    const after = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["status", "updatedAt"]);
    const afterToCompare = omit(after, ["status", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
