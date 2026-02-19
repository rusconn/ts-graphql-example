import { ErrorCode, TodoStatus } from "../../../../../src/presentation/graphql/schema/_types.ts";

import { client, domain, graph } from "../../../../data.ts";
import { clearTables, clearTodos, dummyId, seed } from "../../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type {
  TodoStatusChangeMutation,
  TodoStatusChangeMutationVariables,
  TodoStatusChangeNodeQuery,
  TodoStatusChangeNodeQueryVariables,
} from "../_types.ts";

const todoStatusChange = executeSingleResultOperation<
  TodoStatusChangeMutation,
  TodoStatusChangeMutationVariables
>(/* GraphQL */ `
  mutation TodoStatusChange($id: ID!, $status: TodoStatus!) {
    todoStatusChange(id: $id, status: $status) {
      __typename
      ... on TodoStatusChangeSuccess {
        todo {
          id
          title
          description
          status
          createdAt
          updatedAt
        }
      }
    }
  }
`);

const node = executeSingleResultOperation<
  TodoStatusChangeNodeQuery,
  TodoStatusChangeNodeQueryVariables
>(/* GraphQL */ `
  query TodoStatusChangeNode($id: ID!) {
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
    const { data, errors } = await todoStatusChange({
      token: client.tokens.alice,
      variables: {
        id: "abracadabra", // invalid
        status: TodoStatus.Done,
      },
    });
    expect(data?.todoStatusChange).toBeNull();
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
    const { data } = await todoStatusChange({
      token: client.tokens.alice,
      variables: {
        id: dummyTodoId,
        status: TodoStatus.Done,
      },
    });
    expect(data?.todoStatusChange?.__typename).toBe("ResourceNotFoundError");
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
    const { data } = await todoStatusChange({
      token: client.tokens.alice,
      variables: {
        id: graph.todos.admin1.id,
        status: TodoStatus.Done,
      },
    });
    expect(data?.todoStatusChange?.__typename).toBe("ResourceNotFoundError");
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
    assert(todo.data?.node?.__typename === "Todo", todo.data?.node?.__typename);
    expect(todo.data.node).toStrictEqual(graph.todos.alice1);
    expect(todo.data.node.status).toBe(TodoStatus.Pending);
  }

  // act
  {
    const { data } = await todoStatusChange({
      token: client.tokens.alice,
      variables: {
        id: graph.todos.alice1.id,
        status: TodoStatus.Done,
      },
    });
    assert(
      data?.todoStatusChange?.__typename === "TodoStatusChangeSuccess",
      data?.todoStatusChange?.__typename,
    );
    expect(data.todoStatusChange.todo.id).toBe(graph.todos.alice1.id);
    expect(data.todoStatusChange.todo.title).toBe(graph.todos.alice1.title);
    expect(data.todoStatusChange.todo.description).toBe(graph.todos.alice1.description);
    expect(data.todoStatusChange.todo.status).toBe(TodoStatus.Done);
    expect(Date.parse(data.todoStatusChange.todo.updatedAt!)).toBeGreaterThan(
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
    expect(todo.data.node.status).toBe(TodoStatus.Done);
    expect(Date.parse(todo.data.node.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.todos.alice1.updatedAt),
    );
  }
});
