import type { UesrTodoQuery, UesrTodoQueryVariables } from "it/modules/schema";
import { ContextData, DBData, GraphData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as Graph from "@/modules/common/schema";

const users = [DBData.admin, DBData.alice, DBData.bob];
const todos = [DBData.adminTodo1, DBData.aliceTodo];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const query = /* GraphQL */ `
  query UesrTodo($id: ID!, $todoId: ID!) {
    node(id: $id) {
      __typename
      ... on User {
        todo(id: $todoId) {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

const executeQuery = executeSingleResultOperation(query)<UesrTodoQuery, UesrTodoQueryVariables>;

describe("authorization", () => {
  const allowedPatterns = [
    [ContextData.admin, GraphData.admin.id, GraphData.adminTodo1.id],
    [ContextData.alice, GraphData.alice.id, GraphData.aliceTodo.id],
    [ContextData.admin, GraphData.admin.id, GraphData.aliceTodo.id],
    [ContextData.admin, GraphData.alice.id, GraphData.aliceTodo.id],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.alice, GraphData.admin.id, GraphData.adminTodo1.id],
    [ContextData.alice, GraphData.alice.id, GraphData.adminTodo1.id],
    [ContextData.guest, GraphData.admin.id, GraphData.adminTodo1.id],
    [ContextData.guest, GraphData.alice.id, GraphData.aliceTodo.id],
  ] as const;

  test.each(allowedPatterns)("allowed %o %s %s", async (user, id, todoId) => {
    const { errors } = await executeQuery({
      user,
      variables: { id, todoId },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %s %s", async (user, id, todoId) => {
    const { errors } = await executeQuery({
      user,
      variables: { id, todoId },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$todoId", () => {
    test.each(GraphData.validTodoIds)("valid %s", async todoId => {
      const { errors } = await executeQuery({
        variables: { id: GraphData.admin.id, todoId },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidTodoIds)("invalid %s", async todoId => {
      const { errors } = await executeQuery({
        variables: { id: GraphData.admin.id, todoId },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  test("not exists", async () => {
    const { data } = await executeQuery({
      variables: {
        id: GraphData.admin.id,
        todoId: GraphData.adminTodo1.id.slice(0, -1),
      },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo).toBeNull();
  });

  test("exists, owned", async () => {
    const { data } = await executeQuery({
      variables: {
        id: GraphData.admin.id,
        todoId: GraphData.adminTodo1.id,
      },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo).not.toBeNull();
  });

  test("exists, but not owned", async () => {
    const { data } = await executeQuery({
      user: ContextData.alice,
      variables: { id: GraphData.alice.id, todoId: GraphData.adminTodo1.id },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo).toBeNull();
  });

  it("should set correct parent user id", async () => {
    const { data } = await executeQuery({
      variables: { id: GraphData.admin.id, todoId: GraphData.adminTodo1.id },
    });

    if (data?.node?.__typename !== "User") {
      fail();
    }

    expect(data.node.todo?.user?.id).toBe(GraphData.admin.id);
  });
});
