import type { DeleteTodoMutation, DeleteTodoMutationVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables, clearTodos } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as Graph from "@/modules/common/schema";

const executeMutation = executeSingleResultOperation(/* GraphQL */ `
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      __typename
      ... on DeleteTodoSuccess {
        id
      }
      ... on TodoNotFoundError {
        message
      }
    }
  }
`)<DeleteTodoMutation, DeleteTodoMutationVariables>;

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

const resetTodos = async () => {
  await clearTodos();
  await seedData.todos();
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
  await seedData.todos();
});

describe("authorization", () => {
  beforeEach(resetTodos);

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
    beforeEach(resetTodos);

    test.each(GraphData.validTodoIds)("valid %s", async id => {
      const { errors } = await executeMutation({
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidTodoIds)("invalid %s", async id => {
      const { errors } = await executeMutation({
        variables: { id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(resetTodos);

  test("not exists", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    expect(data?.deleteTodo?.__typename).toBe("TodoNotFoundError");
  });

  test("exists, but not owned", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.aliceTodo.id },
    });

    expect(data?.deleteTodo?.__typename).toBe("TodoNotFoundError");
  });

  it("should delete todo", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id },
    });

    expect(data?.deleteTodo?.__typename).toBe("DeleteTodoSuccess");

    const todo = await prisma.todo.findUnique({
      where: { id: DBData.adminTodo1.id },
    });

    expect(todo).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await prisma.todo.count();

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id },
    });

    expect(data?.deleteTodo?.__typename).toBe("DeleteTodoSuccess");

    const todo = await prisma.todo.findUnique({
      where: { id: DBData.adminTodo1.id },
    });

    const after = await prisma.todo.count();

    expect(todo).toBeNull();
    expect(after).toBe(before - 1);
  });
});
