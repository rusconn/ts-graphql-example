import { gql } from "graphql-tag";
import omit from "lodash/omit";

import type { UpdateTodoMutation, UpdateTodoMutationVariables } from "it/graphql/types";
import { ContextData, DBData, GraphData } from "it/data";
import { prisma } from "it/datasources";
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

const seedUsers = () => prisma.user.createMany({ data: users });
const seedTodos = () => prisma.todo.createMany({ data: todos });

const query = gql`
  mutation UpdateTodo($id: ID!, $input: UpdateTodoInput!) {
    updateTodo(id: $id, input: $input) {
      ... on UpdateTodoSuccess {
        __typename
        todo {
          id
          updatedAt
          title
          description
          status
        }
      }
      ... on TodoNotFoundError {
        __typename
        message
      }
    }
  }
`;

const executeMutation = executeSingleResultOperation(query)<
  UpdateTodoMutation,
  UpdateTodoMutationVariables
>;

beforeAll(async () => {
  await clearTables();
  await seedUsers();
  await seedTodos();
});

describe("authorization", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  const input = { title: nonEmptyString("foo"), description: "", status: Graph.TodoStatus.Done };

  const allowedPatterns = [
    [ContextData.admin, GraphData.adminTodo1],
    [ContextData.admin, GraphData.aliceTodo],
    [ContextData.alice, GraphData.adminTodo1],
    [ContextData.alice, GraphData.aliceTodo],
  ] as const;

  const notAllowedPatterns = [
    [ContextData.guest, GraphData.adminTodo1],
    [ContextData.guest, GraphData.aliceTodo],
  ] as const;

  test.each(allowedPatterns)("allowed %o %o", async (user, { id }) => {
    const { errors } = await executeMutation({
      user,
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAllowedPatterns)("not allowed %o %o", async (user, { id }) => {
    const { errors } = await executeMutation({
      user,
      variables: { input, id },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  describe("$id", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

    const input = { title: nonEmptyString("foo"), description: "", status: Graph.TodoStatus.Done };

    test.each(GraphData.validTodoIds)("valid %s", async id => {
      const { errors } = await executeMutation({ variables: { id, input } });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(GraphData.invalidTodoIds)("invalid %s", async id => {
      const { errors } = await executeMutation({ variables: { id, input } });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });
  });

  describe("$input", () => {
    afterAll(async () => {
      await clearTables();
      await seedUsers();
      await seedTodos();
    });

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
    ].map(([title, description]) => ({
      title: nonEmptyString(title),
      description,
      status: Graph.TodoStatus.Done,
    }));

    const invalids = [
      ["A".repeat(titleMaxCharacters + 1), ""],
      ["🅰".repeat(titleMaxCharacters + 1), ""],
      ["A", "A".repeat(descriptionMaxCharacters + 1)],
      ["🅰", "🅰".repeat(descriptionMaxCharacters + 1)],
    ].map(([title, description]) => ({
      title: nonEmptyString(title),
      description,
      status: Graph.TodoStatus.Done,
    }));

    test.each(valids)("valid %s", async input => {
      const { errors } = await executeMutation({
        variables: { input, id: GraphData.adminTodo1.id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    test.each(invalids)("invalid %s", async input => {
      const { errors } = await executeMutation({
        variables: { input, id: GraphData.adminTodo1.id },
      });

      const errorCodes = errors?.map(({ extensions }) => extensions?.code);

      expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
    });

    const validPartialInputs = [
      { description: "", status: Graph.TodoStatus.Done },
      { status: Graph.TodoStatus.Done, title: nonEmptyString("x") },
      { title: nonEmptyString("x"), description: "" },
    ];

    const invalidPartialInputs = [{ title: null }, { description: null }, { status: null }];

    test.each(validPartialInputs)(
      "field absence should not cause bad input error: %s",
      async input => {
        const { errors } = await executeMutation({
          variables: { input, id: GraphData.adminTodo1.id },
        });

        const errorCodes = errors?.map(({ extensions }) => extensions?.code);

        expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
      }
    );

    test.each(invalidPartialInputs)(
      "some fields should cause bad input error if null: %s",
      async input => {
        const { errors } = await executeMutation({
          variables: { input, id: GraphData.adminTodo1.id },
        });

        const errorCodes = errors?.map(({ extensions }) => extensions?.code);

        expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
      }
    );
  });
});

describe("logic", () => {
  afterAll(async () => {
    await clearTables();
    await seedUsers();
    await seedTodos();
  });

  test("not exists", async () => {
    const { data } = await executeMutation({
      variables: { input: {}, id: GraphData.adminTodo1.id.slice(0, -1) },
    });

    expect(data?.updateTodo?.__typename === "TodoNotFoundError").toBeTruthy();
  });

  test("exists, but not owned", async () => {
    const { data } = await executeMutation({
      variables: { input: {}, id: GraphData.aliceTodo.id },
    });

    expect(data?.updateTodo?.__typename === "TodoNotFoundError").toBeTruthy();
  });

  it("should update using input", async () => {
    const input = {
      title: nonEmptyString("bar"),
      description: "baz",
      status: Graph.TodoStatus.Done,
    };

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input },
    });

    if (!data || !data.updateTodo || data.updateTodo.__typename !== "UpdateTodoSuccess") {
      fail();
    }

    const todo = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    expect(todo.title).toBe(input.title);
    expect(todo.description).toBe(input.description);
    expect(todo.status).toBe(input.status);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input: {} },
    });

    if (!data || !data.updateTodo || data.updateTodo.__typename !== "UpdateTodoSuccess") {
      fail();
    }

    const after = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    expect(before.title).toBe(after.title);
    expect(before.description).toBe(after.description);
    expect(before.status).toBe(after.status);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const input = {
      title: nonEmptyString("bar"),
      description: "baz",
      status: Graph.TodoStatus.Done,
    };

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input },
    });

    if (!data || !data.updateTodo || data.updateTodo.__typename !== "UpdateTodoSuccess") {
      fail();
    }

    const after = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    const input = {
      title: nonEmptyString("bar"),
      description: "baz",
      status: Graph.TodoStatus.Done,
    };

    const { data } = await executeMutation({
      variables: { id: GraphData.adminTodo1.id, input },
    });

    if (!data || !data.updateTodo || data.updateTodo.__typename !== "UpdateTodoSuccess") {
      fail();
    }

    const after = await prisma.todo.findUniqueOrThrow({ where: { id: DBData.adminTodo1.id } });

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["title", "description", "status", "updatedAt"]);
    const afterToCompare = omit(after, ["title", "description", "status", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
