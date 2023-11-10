import { omit } from "remeda";

import type { UpdateTodoMutation, UpdateTodoMutationVariables } from "tests/modules/schema";
import { ContextData, DBData, GraphData } from "tests/data";
import { clearTables } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeMutation = executeSingleResultOperation<
  UpdateTodoMutation,
  UpdateTodoMutationVariables
>(/* GraphQL */ `
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      __typename
      ... on UpdateTodoSuccess {
        todo {
          id
          updatedAt
          title
          description
          status
        }
      }
      ... on TodoNotFoundError {
        message
      }
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
  const input = {
    title: "foo",
    description: "",
    status: Graph.TodoStatus.Done,
  };

  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.alice,
      variables: { input, id: GraphData.aliceTodo.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input, id: GraphData.aliceTodo.id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("id", () => {
    const input = {
      title: "title",
      description: "description",
      status: Graph.TodoStatus.Done,
    };

    test("not ParseError -> not BadUserInput", async () => {
      const { errors } = await executeMutation({
        variables: { id: GraphData.validTodoIds[0], input },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("ParseError -> BadUserInput", async () => {
      const { errors } = await executeMutation({
        variables: { id: GraphData.invalidTodoIds[0], input },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });

  describe("input", () => {
    const id = GraphData.validTodoIds[0];

    test("not ParseError -> not BadUserInput", async () => {
      const { errors } = await executeMutation({
        variables: { id, input: { title: "title" } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test("ParseError -> BadUserInput", async () => {
      const { errors } = await executeMutation({
        variables: { id, input: { title: null } },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(() =>
    prisma.todo.upsert({
      where: { id: DBData.adminTodo1.id },
      create: DBData.adminTodo1,
      update: DBData.adminTodo1,
    })
  );

  const input = {
    title: "bar",
    description: "baz",
    status: Graph.TodoStatus.Done,
  };

  test("not exists", async () => {
    const { data } = await executeMutation({
      variables: { input: {}, id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    expect(data?.updateTodo?.__typename).toBe("TodoNotFoundError");
  });

  test("exists, but not owned", async () => {
    const { data } = await executeMutation({
      variables: { input: {}, id: GraphData.aliceTodo.id },
    });

    expect(data?.updateTodo?.__typename).toBe("TodoNotFoundError");
  });

  it("should update using input", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input },
    });

    expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

    const todo = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    expect(todo.title).toBe(input.title);
    expect(todo.description).toBe(input.description);
    expect(todo.status).toBe(input.status);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input: {} },
    });

    expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

    const after = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    expect(before.title).toBe(after.title);
    expect(before.description).toBe(after.description);
    expect(before.status).toBe(after.status);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input },
    });

    expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

    const after = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input },
    });

    expect(data?.updateTodo?.__typename).toBe("UpdateTodoSuccess");

    const after = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["title", "description", "status", "updatedAt"]);
    const afterToCompare = omit(after, ["title", "description", "status", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
