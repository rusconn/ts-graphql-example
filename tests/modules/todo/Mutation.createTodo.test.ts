import type { CreateTodoMutation, CreateTodoMutationVariables } from "tests/modules/schema.js";
import { ContextData, DBData } from "tests/data/mod.js";
import { clearTables, fail } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import * as Prisma from "@/prisma/mod.js";
import * as Graph from "@/modules/common/schema.js";
import { parseTodoNodeId } from "@/modules/todo/common/parser.js";

const executeMutation = executeSingleResultOperation<
  CreateTodoMutation,
  CreateTodoMutationVariables
>(/* GraphQL */ `
  mutation CreateTodo($input: CreateTodoInput!) {
    createTodo(input: $input) {
      __typename
      ... on CreateTodoSuccess {
        todo {
          id
          title
          description
          status
        }
      }
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

beforeAll(async () => {
  await clearTables();
  await seedData.users();
});

describe("authorization", () => {
  const input = { title: "title", description: "" };

  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.alice,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const titleMax = 100;
  const validInput = { title: "title", description: "description" };

  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeMutation({
      variables: { input: { ...validInput } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { errors } = await executeMutation({
      variables: { input: { ...validInput, title: "A".repeat(titleMax + 1) } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

describe("logic", () => {
  const input = {
    title: "foo",
    description: "bar",
  };

  it("should create todo using input", async () => {
    const { data } = await executeMutation({
      variables: { input },
    });

    if (data?.createTodo?.__typename !== "CreateTodoSuccess") {
      fail();
    }

    const id = parseTodoNodeId(data.createTodo.todo.id);

    const todo = await prisma.todo.findUniqueOrThrow({
      where: { id },
    });

    expect(todo.title).toBe(input.title);
    expect(todo.description).toBe(input.description);
  });

  test("status should be PENDING by default", async () => {
    const { data } = await executeMutation({
      variables: { input },
    });

    if (data?.createTodo?.__typename !== "CreateTodoSuccess") {
      fail();
    }

    const id = parseTodoNodeId(data.createTodo.todo.id);

    const todo = await prisma.todo.findUniqueOrThrow({
      where: { id },
    });

    expect(todo.status).toBe(Prisma.TodoStatus.PENDING);
  });
});
