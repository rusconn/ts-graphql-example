import omit from "lodash/omit";

import type { CompleteTodoMutation, CompleteTodoMutationVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeMutation = executeSingleResultOperation(/* GraphQL */ `
  mutation CompleteTodo($id: ID!) {
    completeTodo(id: $id) {
      __typename
      ... on CompleteTodoSuccess {
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
`)<CompleteTodoMutation, CompleteTodoMutationVariables>;

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
  beforeEach(() =>
    prisma.todo.upsert({
      where: { id: DBData.adminTodo1.id },
      create: DBData.adminTodo1,
      update: DBData.adminTodo1,
    })
  );

  test("not exists", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    expect(data?.completeTodo?.__typename).toBe("TodoNotFoundError");
  });

  test("exists, but not owned", async () => {
    const { data } = await executeMutation({
      variables: { id: GraphData.aliceTodo.id },
    });

    expect(data?.completeTodo?.__typename).toBe("TodoNotFoundError");
  });

  it("should update status", async () => {
    const before = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id },
    });

    expect(data?.completeTodo?.__typename).toBe("CompleteTodoSuccess");

    const after = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    expect(before.status).toBe(Graph.TodoStatus.Pending);
    expect(after.status).toBe(Graph.TodoStatus.Done);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id },
    });

    expect(data?.completeTodo?.__typename).toBe("CompleteTodoSuccess");

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
      variables: { id: GraphData.adminTodo1.id },
    });

    expect(data?.completeTodo?.__typename).toBe("CompleteTodoSuccess");

    const after = await prisma.todo.findUniqueOrThrow({
      where: { id: DBData.adminTodo1.id },
    });

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["status", "updatedAt"]);
    const afterToCompare = omit(after, ["status", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
