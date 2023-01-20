import { gql } from "graphql-tag";

import type { DeleteMyTodoMutation, DeleteMyTodoMutationVariables } from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { userAPI, todoAPI } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];

const todos = [
  DBData.adminTodo1,
  DBData.adminTodo2,
  DBData.adminTodo3,
  DBData.aliceTodo,
  DBData.bobTodo,
];

const seedUsers = () => userAPI.createMany(users);
const seedTodos = () => todoAPI.createMany(todos);

const query = gql`
  mutation DeleteMyTodo($id: ID!) {
    deleteMyTodo(id: $id)
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  DeleteMyTodoMutation,
  DeleteMyTodoMutationVariables
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

  const variables = { input: { name: nonEmptyString("foo") } };

  const allowedPatterns = [
    [ContextData.admin, GraphData.adminTodo1],
    [ContextData.alice, GraphData.aliceTodo],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.admin, GraphData.aliceTodo],
    [ContextData.alice, GraphData.adminTodo1],
    [ContextData.alice, GraphData.bobTodo],
    [ContextData.guest, GraphData.adminTodo1],
    [ContextData.guest, GraphData.aliceTodo],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteMyTodo).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteMyTodo).toBeFalsy();
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

  it("should delete todo", async () => {
    const { data } = await executeMutation({ variables: { id: GraphData.adminTodo1.id } });

    if (!data || !data.deleteMyTodo) {
      throw new Error("operation failed");
    }

    const maybeTodo = await todoAPI.getOptional({ id: DBData.adminTodo1.id });

    expect(maybeTodo).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await todoAPI.count();

    const { data } = await executeMutation({ variables: { id: GraphData.adminTodo1.id } });

    if (!data || !data.deleteMyTodo) {
      throw new Error("operation failed");
    }

    const maybeTodo = await todoAPI.getOptional({ id: DBData.adminTodo1.id });

    const after = await todoAPI.count();

    expect(maybeTodo).toBeNull();
    expect(after).toBe(before - 1);
  });
});
