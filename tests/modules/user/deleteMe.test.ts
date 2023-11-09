import type { DeleteMeMutation, DeleteMeMutationVariables } from "tests/modules/schema";
import { ContextData, DBData } from "tests/data";
import { clearUsers } from "tests/helpers";
import { executeSingleResultOperation } from "tests/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";
import { parseUserNodeId } from "@/modules/user/parsers";

const executeMutation = executeSingleResultOperation<
  DeleteMeMutation,
  DeleteMeMutationVariables
>(/* GraphQL */ `
  mutation DeleteMe {
    deleteMe {
      __typename
      ... on DeleteMeSuccess {
        id
      }
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
  todos: [DBData.adminTodo1, DBData.adminTodo2, DBData.adminTodo3],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
  todos: () => prisma.todo.createMany({ data: testData.todos }),
};

const resetUsers = async () => {
  await clearUsers();
  await seedData.users();
};

beforeAll(resetUsers);

describe("authorization", () => {
  beforeEach(resetUsers);

  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.alice,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("logic", () => {
  beforeEach(resetUsers);

  it("should delete user", async () => {
    const { data } = await executeMutation({});

    if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSuccess") {
      fail();
    }

    const id = parseUserNodeId(data.deleteMe.id);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    expect(user).toBeNull();
  });

  it("should not delete others", async () => {
    const before = await prisma.user.count();

    const { data } = await executeMutation({});

    if (!data || !data.deleteMe || data.deleteMe.__typename !== "DeleteMeSuccess") {
      fail();
    }

    const id = parseUserNodeId(data.deleteMe.id);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    const after = await prisma.user.count();

    expect(user).toBeNull();
    expect(after).toBe(before - 1);
  });

  it("should delete his resources", async () => {
    await seedData.todos();

    const before = await prisma.todo.count({
      where: { userId: DBData.admin.id },
    });

    const { data } = await executeMutation({});

    expect(data?.deleteMe?.__typename).toBe("DeleteMeSuccess");

    const after = await prisma.todo.count({
      where: { userId: DBData.admin.id },
    });

    expect(before).not.toBe(0);
    expect(after).toBe(0);
  });
});
