import { TodoStatus } from "../../../../../src/presentation/graphql/schema/_types.ts";

import { client, domain, graph } from "../../../../data.ts";
import { clearTables, clearTodos, seed } from "../../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type {
  TodoCreateMutation,
  TodoCreateMutationVariables,
  TodoCreateNodeQuery,
  TodoCreateNodeQueryVariables,
} from "../_types.ts";

const todoCreate = executeSingleResultOperation<
  TodoCreateMutation, //
  TodoCreateMutationVariables
>(/* GraphQL */ `
  mutation TodoCreate($title: String, $description: String) {
    todoCreate(title: $title, description: $description) {
      __typename
      ... on TodoCreateSuccess {
        todo {
          id
          title
          description
          status
        }
      }
      ... on InvalidInputErrors {
        errors {
          field
        }
      }
    }
  }
`);

const node = executeSingleResultOperation<
  TodoCreateNodeQuery, //
  TodoCreateNodeQueryVariables
>(/* GraphQL */ `
  query TodoCreateNode($id: ID!) {
    node(id: $id) {
      __typename
      id
      ... on Todo {
        title
        description
        status
        createdAt
        updatedAt
      }
      ... on User {
        todos(first: 30) {
          totalCount
        }
      }
    }
  }
`);

beforeAll(async () => {
  await clearTables();
  await seed.users(domain.users.alice);
});

beforeEach(async () => {
  await clearTodos();
});

it("returns validation errors when input is invalid", async () => {
  // precondition
  {
    const todos = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(todos.data?.node?.__typename === "User", todos.data?.node?.__typename);
    expect(todos.data?.node.todos?.totalCount).toBe(0);
  }

  // act
  {
    const { data } = await todoCreate({
      token: client.tokens.alice,
      variables: {
        title: "a".repeat(100 + 1),
        description: "a".repeat(5_000 + 1),
      },
    });
    assert(data?.todoCreate?.__typename === "InvalidInputErrors", data?.todoCreate?.__typename);
    expect(data.todoCreate.errors.map((e) => e.field).sort()).toStrictEqual([
      "description",
      "title",
    ]);
  }

  // postcondition
  {
    const todos = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(todos.data?.node?.__typename === "User", todos.data?.node?.__typename);
    expect(todos.data?.node.todos?.totalCount).toBe(0);
  }
});

it("creates a todo using input", async () => {
  // precondition
  {
    const todos = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(todos.data?.node?.__typename === "User", todos.data?.node?.__typename);
    expect(todos.data?.node.todos?.totalCount).toBe(0);
  }

  // act
  let todoId: string;
  {
    const { data } = await todoCreate({
      token: client.tokens.alice,
      variables: {
        title: "foo",
        description: "bar",
      },
    });
    assert(data?.todoCreate?.__typename === "TodoCreateSuccess", data?.todoCreate?.__typename);
    expect(data.todoCreate.todo.title).toBe("foo");
    expect(data.todoCreate.todo.description).toBe("bar");
    todoId = data.todoCreate.todo.id;
  }

  // postcondition
  {
    const todos = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(todos.data?.node?.__typename === "User", todos.data?.node?.__typename);
    expect(todos.data?.node.todos?.totalCount).toBe(1);

    const todo = await node({
      token: client.tokens.alice,
      variables: { id: todoId },
    });
    assert(todo.data?.node?.__typename === "Todo", todo.data?.node?.__typename);
    expect(todo.data.node.title).toBe("foo");
    expect(todo.data.node.description).toBe("bar");
  }
});

it("creates a todo with default values", async () => {
  // precondition
  {
    const todos = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(todos.data?.node?.__typename === "User", todos.data?.node?.__typename);
    expect(todos.data?.node.todos?.totalCount).toBe(0);
  }

  // act
  let todoId: string;
  {
    const { data } = await todoCreate({
      token: client.tokens.alice,
      variables: {},
    });
    assert(data?.todoCreate?.__typename === "TodoCreateSuccess", data?.todoCreate?.__typename);
    expect(data.todoCreate.todo.title).toBe("");
    expect(data.todoCreate.todo.description).toBe("");
    expect(data.todoCreate.todo.status).toBe(TodoStatus.Pending);
    todoId = data.todoCreate.todo.id;
  }

  // postcondition
  {
    const todos = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(todos.data?.node?.__typename === "User", todos.data?.node?.__typename);
    expect(todos.data?.node.todos?.totalCount).toBe(1);

    const todo = await node({
      token: client.tokens.alice,
      variables: { id: todoId },
    });
    assert(todo.data?.node?.__typename === "Todo", todo.data?.node?.__typename);
    expect(todo.data.node.title).toBe("");
    expect(todo.data.node.description).toBe("");
    expect(todo.data.node.status).toBe(TodoStatus.Pending);
  }
});
