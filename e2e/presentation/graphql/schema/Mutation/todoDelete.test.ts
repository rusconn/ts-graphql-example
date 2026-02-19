import { ErrorCode } from "../../../../../src/presentation/graphql/schema/_types.ts";

import { client, domain, graph } from "../../../../data.ts";
import { clearTables, clearTodos, dummyId, seed } from "../../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type {
  TodoDeleteMutation,
  TodoDeleteMutationVariables,
  TodoDeleteNodeQuery,
  TodoDeleteNodeQueryVariables,
} from "../_types.ts";

const todoDelete = executeSingleResultOperation<
  TodoDeleteMutation, //
  TodoDeleteMutationVariables
>(/* GraphQL */ `
  mutation TodoDelete($id: ID!) {
    todoDelete(id: $id) {
      __typename
      ... on TodoDeleteSuccess {
        id
      }
    }
  }
`);

const node = executeSingleResultOperation<
  TodoDeleteNodeQuery, //
  TodoDeleteNodeQueryVariables
>(/* GraphQL */ `
  query TodoDeleteNode($id: ID!) {
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
    const { data, errors } = await todoDelete({
      token: client.tokens.alice,
      variables: {
        id: "abracadabra", // invalid
      },
    });
    expect(data?.todoDelete).toBeNull();
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
    const { data } = await todoDelete({
      token: client.tokens.alice,
      variables: { id: dummyTodoId },
    });
    expect(data?.todoDelete?.__typename).toBe("ResourceNotFoundError");
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
    const { data } = await todoDelete({
      token: client.tokens.alice,
      variables: { id: graph.todos.admin1.id },
    });
    expect(data?.todoDelete?.__typename).toBe("ResourceNotFoundError");
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
    const { data } = await todoDelete({
      token: client.tokens.alice,
      variables: {
        id: graph.todos.admin1.id,
      },
    });
    expect(data?.todoDelete?.__typename).toBe("ResourceNotFoundError");
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
    const { data } = await todoDelete({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    assert(data?.todoDelete?.__typename === "TodoDeleteSuccess", data?.todoDelete?.__typename);
    expect(data.todoDelete.id).toBe(graph.todos.alice1.id);
  }

  // postcondition
  {
    const todo = await node({
      token: client.tokens.alice,
      variables: { id: graph.todos.alice1.id },
    });
    expect(todo.data?.node).toBeNull();
  }
});
