import type { GraphQLFormattedError } from "graphql";
import { gql } from "apollo-server";

import type { DeleteUserMutation, DeleteUserMutationVariables } from "it/types";
import {
  admin,
  adminTodo1,
  adminTodo2,
  adminTodo3,
  alice,
  bob,
  guest,
  invalidUserIds,
  validUserIds,
} from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { nonEmptyString } from "@/utils";
import { ErrorCode, User } from "@/types";

const todos = [adminTodo1, adminTodo2, adminTodo3];

const seedUsers = () => prisma.user.createMany({ data: [admin, alice, bob] });
const seedAdminTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

type ResponseType = {
  data?: DeleteUserMutation | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
  variables: DeleteUserMutationVariables;
};

/**
 * token のデフォルトは admin.token
 * @param params token の上書きや variables の指定に使う
 */
const executeMutation = (params: ExecuteQueryParams) => {
  const token = "token" in params ? params.token : admin.token;
  const { variables } = params;

  return server.executeOperation(
    { query, variables },
    makeContext({ query, token })
  ) as Promise<ResponseType>;
};

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
    [admin, admin],
    [admin, alice],
    [alice, alice],
  ] as const;

  const notAllowedPatterns = [
    [alice, admin],
    [alice, bob],
    [guest, admin],
    [guest, alice],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteUser).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async ({ token }, { id }) => {
    const { data, errors } = await executeMutation({
      token,
      variables: { ...variables, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.deleteUser).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
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

    test.each(validUserIds)("valid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.deleteUser).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidUserIds)("invalid %s", async id => {
      const { data, errors } = await executeMutation({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.deleteUser).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
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
    const { data } = await executeMutation({ variables: { id: bob.id } });

    if (!data || !data.deleteUser) {
      throw new Error("operation failed");
    }

    const maybeUser = await prisma.user.findUnique({ where: { id: data.deleteUser.id } });

    expect(maybeUser).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await prisma.user.count();

    const { data } = await executeMutation({ variables: { id: bob.id } });

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

    const before = await prisma.todo.count({ where: { userId: admin.id } });

    const { data } = await executeMutation({ variables: { id: admin.id } });

    if (!data || !data.deleteUser) {
      throw new Error("operation failed");
    }

    const after = await prisma.todo.count({ where: { id: admin.id } });

    expect(before).not.toBe(0);
    expect(after).toBe(0);
  });
});
