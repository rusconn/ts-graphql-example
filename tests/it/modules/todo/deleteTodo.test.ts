import type { DeleteTodoMutation, DeleteTodoMutationVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { clearTables, clearTodos } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { prisma } from "@/prisma";
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

  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.alice,
      variables: { id: GraphData.aliceTodo.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { id: GraphData.aliceTodo.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  beforeEach(resetTodos);

  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeMutation({
      variables: { id: GraphData.validTodoIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { errors } = await executeMutation({
      variables: { id: GraphData.invalidTodoIds[0] },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
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
