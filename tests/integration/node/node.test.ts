import { gql } from "graphql-tag";
import pick from "lodash/pick";

import type { NodeQuery, NodeQueryVariables } from "it/types";
import { defaultContext } from "it/context";
import {
  admin,
  alice,
  bob,
  adminTodo1,
  adminTodo2,
  adminTodo3,
  guest,
  aliceTodo,
  bobTodo,
  validIds,
  invalidIds,
} from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { todoId, userId } from "@/utils";
import { Context, ErrorCode } from "@/types";

const users = [admin, alice, bob];
const todos = [adminTodo1, adminTodo2, adminTodo3, aliceTodo, bobTodo];

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  query Node($id: ID!) {
    node(id: $id) {
      id
      ... on User {
        name
      }
      ... on Todo {
        title
      }
    }
  }
`;

type ExecuteQueryParams = {
  user?: Context["user"];
  variables: NodeQueryVariables;
};

/**
 * user のデフォルトは admin
 * @param params user の上書きや variables の指定に使う
 */
const executeQuery = async (params: ExecuteQueryParams) => {
  const user = params.user ?? admin;
  const { variables } = params;

  const res = await server.executeOperation<NodeQuery>(
    { query, variables },
    { contextValue: { ...defaultContext, user } }
  );

  if (res.body.kind !== "single") {
    throw new Error("not single");
  }

  return res.body.singleResult;
};

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

describe("authorization", () => {
  describe("user", () => {
    const allowedPatterns = [
      [admin, admin],
      [admin, alice],
      [alice, alice],
    ] as const;

    const notAllowedPatterns = [
      [alice, bob],
      [guest, admin],
      [guest, alice],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });
  });

  describe("todo", () => {
    const allowedPatterns = [
      [admin, adminTodo1],
      [admin, aliceTodo],
      [alice, aliceTodo],
    ] as const;

    const notAllowedPatterns = [
      [alice, bobTodo],
      [guest, adminTodo1],
      [guest, aliceTodo],
    ] as const;

    test.each(allowedPatterns)("allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });

    test.each(notAllowedPatterns)("not allowed %o", async (user, { id }) => {
      const { data, errors } = await executeQuery({ user, variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
    });
  });
});

describe("validation", () => {
  describe("$id", () => {
    test.each(validIds)("valid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).not.toBeFalsy();
      expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });

    test.each(invalidIds)("invalid %s", async id => {
      const { data, errors } = await executeQuery({ variables: { id } });
      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(data?.node).toBeFalsy();
      expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.BadUserInput]));
    });
  });
});

describe("query user", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({ variables: { id: admin.id } });

    expect(data?.node).toEqual({ ...pick(admin, ["name"]), id: admin.id });
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({ variables: { id: userId() } });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
  });
});

describe("query todo", () => {
  it("should return item correctly", async () => {
    const { data } = await executeQuery({ variables: { id: adminTodo1.id } });

    expect(data?.node).toEqual({ ...pick(adminTodo1, ["title"]), id: adminTodo1.id });
  });

  it("should return not found error if not found", async () => {
    const { data, errors } = await executeQuery({ variables: { id: todoId() } });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.node).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.NotFound]));
  });
});
