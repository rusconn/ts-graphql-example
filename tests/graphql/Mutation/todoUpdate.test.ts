import { ErrorCode, TodoStatus } from "../../../src/graphql/_schema.ts";

import { graph, client, domain } from "../../data.ts";
import { clearTables, clearTodos, dummyId, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type {
  TodoUpdateMutation,
  TodoUpdateMutationVariables,
  TodoUpdateNodeQuery,
  TodoUpdateNodeQueryVariables,
} from "../_schema.ts";

const todoUpdate = executeSingleResultOperation<
  TodoUpdateMutation, //
  TodoUpdateMutationVariables
>(/* GraphQL */ `
  mutation TodoUpdate($id: ID!, $title: String, $description: String, $status: TodoStatus) {
    todoUpdate(id: $id, title: $title, description: $description, status: $status) {
      __typename
      ... on TodoUpdateSuccess {
        todo {
          id
          title
          description
          status
          createdAt
          updatedAt
        }
      }
      ... on InvalidInputErrors {
        errors {
          field
          message
        }
      }
    }
  }
`);

const node = executeSingleResultOperation<
  TodoUpdateNodeQuery, //
  TodoUpdateNodeQueryVariables
>(/* GraphQL */ `
  query TodoUpdateNode($id: ID!) {
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
    }
  }
`);

beforeAll(async () => {
  await clearTables();
  await seed.users(domain.users.alice, domain.users.admin);
});

beforeEach(async () => {
  await clearTodos();
  await seed.todos(domain.todos.alice1);
});

it("returns an error when id is invalid", async () => {
  // precondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.alice1);
  }

  // act
  {
    const { data, errors } = await todoUpdate({
      token: client.tokens.alice,
      variables: {
        id: "abracadabra", // invalid
      },
    });
    expect(data?.todoUpdate).toBeNull();
    expect(errors?.map((e) => e.extensions.code)).toStrictEqual([ErrorCode.BadUserInput]);
  }

  // postcondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.alice1);
  }
});

it("returns validation errors when input is invalid", async () => {
  // precondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.alice1);
  }

  // act
  {
    const { data } = await todoUpdate({
      token: client.tokens.alice,
      variables: {
        id: graph.todos.alice1.id,
        title: null, // invalid
        description: null, // invalid
        status: null, // invalid
      },
    });
    assert(data?.todoUpdate?.__typename === "InvalidInputErrors", data?.todoUpdate?.__typename);
    expect(data.todoUpdate.errors.map((e) => e.field).sort()).toStrictEqual([
      "description",
      "status",
      "title",
    ]);
  }

  // postcondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.alice1);
  }
});

it("returns not found when id not exists on graph", async () => {
  const dummyTodoId = dummyId.todo();

  // precondition
  {
    const todo = await node({
      token: client.tokens.admin,
      variables: { id: dummyTodoId },
    });
    expect(todo.data?.node).toBeNull();
  }

  // act
  {
    const { data } = await todoUpdate({
      token: client.tokens.alice,
      variables: { id: dummyTodoId },
    });
    expect(data?.todoUpdate?.__typename).toBe("ResourceNotFoundError");
  }

  // postcondition
  {
    const todo = await node({
      token: client.tokens.admin,
      variables: { id: dummyTodoId },
    });
    expect(todo.data?.node).toBeNull();
  }
});

it("returns not found when client does not own todo", async () => {
  // seed
  await seed.todos(domain.todos.admin1);

  // precondition
  {
    const todo = await node({
      token: client.tokens.admin,
      variables: { id: graph.todos.admin1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.admin1);
  }

  // act
  {
    const { data } = await todoUpdate({
      token: client.tokens.alice,
      variables: {
        id: graph.todos.admin1.id,
      },
    });
    expect(data?.todoUpdate?.__typename).toBe("ResourceNotFoundError");
  }

  // postcondition
  {
    const todo = await node({
      token: client.tokens.admin,
      variables: { id: graph.todos.admin1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.admin1);
  }
});

it("updates todo", async () => {
  // precondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.alice1);
  }

  // act
  {
    const { data } = await todoUpdate({
      token: client.tokens.alice,
      variables: {
        id: graph.todos.alice1.id,
        title: "foo",
        description: "bar",
        status: TodoStatus.Done,
      },
    });
    assert(data?.todoUpdate?.__typename === "TodoUpdateSuccess", data?.todoUpdate?.__typename);
    expect(data.todoUpdate.todo.id).toBe(graph.todos.alice1.id);
    expect(data.todoUpdate.todo.title).toBe("foo");
    expect(data.todoUpdate.todo.description).toBe("bar");
    expect(data.todoUpdate.todo.status).toBe(TodoStatus.Done);
    expect(Date.parse(data.todoUpdate.todo.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.todos.alice1.updatedAt),
    );
  }

  // postcondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    assert(todo.data?.node?.__typename === "Todo", todo.data?.node?.__typename);
    expect(todo.data.node.id).toBe(graph.todos.alice1.id);
    expect(todo.data.node.title).toBe("foo");
    expect(todo.data.node.description).toBe("bar");
    expect(todo.data.node.status).toBe(TodoStatus.Done);
    expect(Date.parse(todo.data.node.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.todos.alice1.updatedAt),
    );
  }
});

it("updates only updatedAt when input is empty", async () => {
  // precondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    expect(todo.data?.node).toStrictEqual(graph.todos.alice1);
  }

  // act
  {
    const { data } = await todoUpdate({
      token: client.tokens.alice,
      variables: {
        id: graph.todos.alice1.id,
      },
    });
    assert(data?.todoUpdate?.__typename === "TodoUpdateSuccess", data?.todoUpdate?.__typename);
    expect(data.todoUpdate.todo.id).toBe(graph.todos.alice1.id);
    expect(data.todoUpdate.todo.title).toBe(graph.todos.alice1.title);
    expect(data.todoUpdate.todo.description).toBe(graph.todos.alice1.description);
    expect(data.todoUpdate.todo.status).toBe(graph.todos.alice1.status);
    expect(Date.parse(data.todoUpdate.todo.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.todos.alice1.updatedAt),
    );
  }

  // postcondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    assert(todo.data?.node?.__typename === "Todo", todo.data?.node?.__typename);
    expect(todo.data.node.id).toBe(graph.todos.alice1.id);
    expect(todo.data.node.title).toBe(graph.todos.alice1.title);
    expect(todo.data.node.description).toBe(graph.todos.alice1.description);
    expect(todo.data.node.status).toBe(graph.todos.alice1.status);
    expect(Date.parse(todo.data.node.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.todos.alice1.updatedAt),
    );
  }
});
