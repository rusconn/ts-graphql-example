import type { CreateTodoMutation, CreateTodoMutationVariables } from "it/modules/schema";
import { ContextData, DBData } from "it/data";
import { prisma } from "it/datasources";
import { clearTables } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import * as DataSource from "@/datasources";
import * as Graph from "@/modules/common/schema";
import { parseTodoNodeId } from "@/modules/todo/parsers";

const executeMutation = executeSingleResultOperation(/* GraphQL */ `
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
`)<CreateTodoMutation, CreateTodoMutationVariables>;

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
  const input = {
    title: "title",
    description: "",
  };

  const alloweds = [ContextData.admin, ContextData.alice, ContextData.bob] as const;
  const notAllowed = [ContextData.guest] as const;

  test.each(alloweds)("allowed %o %o", async user => {
    const { errors } = await executeMutation({
      user,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowed)("not allowed %o %o", async user => {
    const { errors } = await executeMutation({
      user,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$input", () => {
    // 文字数は文字列の長さやバイト数とは異なるので注意
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/String/length#unicode
    // 合字は複数文字とカウントしていいものとする
    const titleMaxCharacters = 100;
    const descriptionMaxCharacters = 5000;

    const valids = [
      ["A".repeat(titleMaxCharacters), ""],
      ["🅰".repeat(titleMaxCharacters), ""],
      ["A", "A".repeat(descriptionMaxCharacters)],
      ["🅰", "🅰".repeat(descriptionMaxCharacters)],
    ].map(([title, description]) => ({ title, description }));

    const invalids = [
      ["A".repeat(titleMaxCharacters + 1), ""],
      ["🅰".repeat(titleMaxCharacters + 1), ""],
      ["A", "A".repeat(descriptionMaxCharacters + 1)],
      ["🅰", "🅰".repeat(descriptionMaxCharacters + 1)],
    ].map(([title, description]) => ({ title, description }));

    test.each(valids)("valid %s", async input => {
      const { errors } = await executeMutation({
        variables: { input },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async input => {
      const { errors } = await executeMutation({
        variables: { input },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
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

    expect(todo.status).toBe(DataSource.TodoStatus.PENDING);
  });
});
