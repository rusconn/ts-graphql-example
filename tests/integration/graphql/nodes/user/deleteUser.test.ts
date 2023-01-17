import { gql } from "graphql-tag";

import type { DeleteUserMutation, DeleteUserMutationVariables } from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";
import { nonEmptyString } from "@/graphql/utils";

const users = [DBData.admin, DBData.alice, DBData.bob];
const todos = [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedAdminTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  DeleteUserMutation,
  DeleteUserMutationVariables
>;

describe("authorization", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
  });

  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  const variables = { input: { name: nonEmptyString("foo") } };

  const allowedPatterns = [
    [ContextData.admin, GraphData.admin],
    [ContextData.admin, GraphData.alice],
    [ContextData.alice, GraphData.alice],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.alice, GraphData.admin],
    [ContextData.alice, GraphData.bob],
    [ContextData.guest, GraphData.admin],
    [ContextData.guest, GraphData.alice],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteUser).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { data, errors } = await executeMutation({
      user,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteUser).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    beforeEach(async () => {
      await clearTables();
      await seedUsers();
    });

    afterAll(async () => {
      await clearTables();
      await seedUsers();
    });

    test.each(GraphData.validUserIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.deleteUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.deleteUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });
});

describe("logic", () => {
  beforeEach(async () => {
    await clearTables();
    await seedUsers();
  });

  afterAll(async () => {
    await clearTables();
    await seedUsers();
  });

  it("should delete user", async () => {
    const { data } = await executeMutation({ variables: { id: GraphData.bob.id } });

    if (!data || !data.deleteUser) {
      throw new Error("operation failed");
    }

    const maybeUser = await prisma.user.findUnique({ where: { id: data.deleteUser.id } });

    expect(maybeUser).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await prisma.user.count();

    const { data } = await executeMutation({ variables: { id: GraphData.bob.id } });

    if (!data || !data.deleteUser) {
      throw new Error("operation failed");
    }

    const maybeUser = await prisma.user.findUnique({ where: { id: data.deleteUser.id } });

    const after = await prisma.user.count();

    expect(maybeUser).toBeNull();
    expect(after).toBe(before - 1);
  });

  it("should delete his resources", async () => {
    await seedAdminTodos();

    const before = await prisma.todo.count({ where: { userId: DBData.admin.id } });

    const { data } = await executeMutation({ variables: { id: GraphData.admin.id } });

    if (!data || !data.deleteUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.count({ where: { userId: DBData.admin.id } });

    expect(before).not.toBe(0);
    expect(after).toBe(0);
  });
});
