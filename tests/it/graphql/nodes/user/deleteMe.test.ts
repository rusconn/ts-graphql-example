import { gql } from "graphql-tag";

import type { DeleteMeMutation, DeleteMeMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { splitUserNodeId } from "@/graphql/adapters";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];
const todos = [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedAdminTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  mutation DeleteMe {
    deleteMe {
      ... on DeleteMeSucceeded {
        __typename
        id
      }
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  DeleteMeMutation,
  DeleteMeMutationVariables
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

  const alloweds = [ContextData.admin, ContextData.alice, ContextData.bob] as const;
  const notAlloweds = [ContextData.guest] as const;

  test.each(alloweds)("allowed %o %o", async user => {
    const { errors } = await executeMutation({ user });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o %o", async user => {
    const { errors } = await executeMutation({ user });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
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
    const { data } = await executeMutation({});

    if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSucceeded") {
      fail();
    }

    const user = await prisma.user.findUnique({
      where: { id: splitUserNodeId(data.deleteMe.id).id },
    });

    expect(user).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await prisma.user.count();

    const { data } = await executeMutation({});

    if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSucceeded") {
      fail();
    }

    const user = await prisma.user.findUnique({
      where: { id: splitUserNodeId(data.deleteMe.id).id },
    });

    const after = await prisma.user.count();

    expect(user).toBeNull();
    expect(after).toBe(before - 1);
  });

  it("should delete his resources", async () => {
    await seedAdminTodos();

    const before = await prisma.todo.count({ where: { userId: DBData.admin.id } });

    const { data } = await executeMutation({});

    if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSucceeded") {
      fail();
    }

    const after = await prisma.todo.count({ where: { userId: DBData.admin.id } });

    expect(before).not.toBe(0);
    expect(after).toBe(0);
  });
});
