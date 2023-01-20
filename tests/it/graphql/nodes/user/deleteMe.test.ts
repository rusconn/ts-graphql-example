import { gql } from "graphql-tag";

import type { DeleteMeMutation, DeleteMeMutationVariables } from "it/graphql/types";
import { ContextData, DBData } from "it/data";
import { userAPI, todoAPI } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [DBData.admin, DBData.alice, DBData.bob];
const todos = [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3];

const seedUsers = () => userAPI.createMany(users);
const seedAdminTodos = () => todoAPI.createMany(todos);

const query = gql`
  mutation DeleteMe {
    deleteMe
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
    const { data, errors } = await executeMutation({ user });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteMe).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o %o", async user => {
    const { data, errors } = await executeMutation({ user });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteMe).toBeFalsy();
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

    if (!data || !data.deleteMe) {
      throw new Error("operation failed");
    }

    const maybeUser = await userAPI.getOptional({ id: data.deleteMe });

    expect(maybeUser).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await userAPI.count();

    const { data } = await executeMutation({});

    if (!data || !data.deleteMe) {
      throw new Error("operation failed");
    }

    const maybeUser = await userAPI.getOptional({ id: data.deleteMe });

    const after = await userAPI.count();

    expect(maybeUser).toBeNull();
    expect(after).toBe(before - 1);
  });

  it("should delete his resources", async () => {
    await seedAdminTodos();

    const before = await todoAPI.count({ userId: DBData.admin.id });

    const { data } = await executeMutation({});

    if (!data || !data.deleteMe) {
      throw new Error("operation failed");
    }

    const after = await todoAPI.count({ userId: DBData.admin.id });

    expect(before).not.toBe(0);
    expect(after).toBe(0);
  });
});
