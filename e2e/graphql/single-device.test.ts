import { client, domain } from "../_shared/data.ts";
import { clearTables, seeders } from "../_shared/helpers.ts";
import {
  executeSingleResultOperation,
  fetchGraphQL,
  getRefreshTokenCookieValue,
} from "./_shared/server.ts";
import {
  type SingleDeviceAccountDeleteMutation,
  type SingleDeviceAccountDeleteMutationVariables,
  type SingleDeviceAccountDeleteNodeQuery,
  type SingleDeviceAccountDeleteNodeQueryVariables,
  type SingleDeviceTodoCreateMutation,
  type SingleDeviceTodoCreateMutationVariables,
  type SingleDeviceTodoStatusChangeMutation,
  type SingleDeviceTodoStatusChangeMutationVariables,
  type SingleDeviceTodoUpdateMutation,
  type SingleDeviceTodoUpdateMutationVariables,
  type SingleDeviceTokenRefreshMutation,
  type SingleDeviceTokenRefreshMutationVariables,
  type SingleDeviceViewerQuery,
  type SingleDeviceViewerQueryVariables,
  TodoStatus,
} from "./_shared/types.ts";

const signupHttp = fetchGraphQL(/* GraphQL */ `
  mutation SingleDeviceSignup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      __typename
      ... on SignupSuccess {
        token
      }
    }
  }
`);

const viewer = executeSingleResultOperation<
  SingleDeviceViewerQuery,
  SingleDeviceViewerQueryVariables
>(/* GraphQL */ `
  query SingleDeviceViewer {
    viewer {
      id
      name
      email
      createdAt
      updatedAt
      todos(first: 10) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        nodes {
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

const todoCreate = executeSingleResultOperation<
  SingleDeviceTodoCreateMutation,
  SingleDeviceTodoCreateMutationVariables
>(/* GraphQL */ `
  mutation SingleDeviceTodoCreate($title: String, $description: String) {
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
    }
  }
`);

const todoUpdate = executeSingleResultOperation<
  SingleDeviceTodoUpdateMutation,
  SingleDeviceTodoUpdateMutationVariables
>(/* GraphQL */ `
  mutation SingleDeviceTodoUpdate(
    $id: ID!
    $title: String
    $description: String
    $status: TodoStatus
  ) {
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
    }
  }
`);

const tokenRefresh = executeSingleResultOperation<
  SingleDeviceTokenRefreshMutation,
  SingleDeviceTokenRefreshMutationVariables
>(/* GraphQL */ `
  mutation SingleDeviceTokenRefresh {
    tokenRefresh {
      __typename
      ... on TokenRefreshSuccess {
        token
      }
    }
  }
`);

const todoStatusChange = executeSingleResultOperation<
  SingleDeviceTodoStatusChangeMutation,
  SingleDeviceTodoStatusChangeMutationVariables
>(/* GraphQL */ `
  mutation SingleDeviceTodoStatusChange($id: ID!, $status: TodoStatus!) {
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
  SingleDeviceAccountDeleteNodeQuery,
  SingleDeviceAccountDeleteNodeQueryVariables
>(/* GraphQL */ `
  query SingleDeviceAccountDeleteNode($id: ID!) {
    node(id: $id) {
      __typename
      id
    }
  }
`);

const accountDelete = executeSingleResultOperation<
  SingleDeviceAccountDeleteMutation,
  SingleDeviceAccountDeleteMutationVariables
>(/* GraphQL */ `
  mutation SingleDeviceAccountDelete($password: String!) {
    accountDelete(password: $password) {
      __typename
      ... on AccountDeleteSuccess {
        id
      }
    }
  }
`);

test("single-device", async () => {
  await clearTables();

  let refreshToken1: string;
  let token1: string;
  {
    const res = await signupHttp({
      variables: {
        name: "single-device",
        email: "single-device@example.com",
        password: "password",
      },
    });
    assert(res.ok);
    refreshToken1 = getRefreshTokenCookieValue(res.headers);
    const json = await res.json();
    assert(json.data.signup.__typename === "SignupSuccess", json.data.signup.__typename);
    token1 = json.data.signup.token;
  }

  let userId: string;
  {
    const { data } = await viewer({
      token: token1,
      refreshToken: refreshToken1,
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("single-device");
    expect(data.viewer.email).toBe("single-device@example.com");
    expect(data.viewer.todos?.totalCount).toBe(0);
    userId = data.viewer.id;
  }

  let todoId: string;
  {
    const { data } = await todoCreate({
      token: token1,
      refreshToken: refreshToken1,
    });
    assert(
      data?.todoCreate?.__typename === "TodoCreateSuccess", //
      data?.todoCreate?.__typename,
    );
    // default values
    expect(data.todoCreate.todo.title).toBe("");
    expect(data.todoCreate.todo.description).toBe("");
    expect(data.todoCreate.todo.status).toBe(TodoStatus.Pending);
    todoId = data.todoCreate.todo.id;
  }

  {
    const { data } = await todoUpdate({
      token: token1,
      refreshToken: refreshToken1,
      variables: {
        id: todoId,
        title: "single-device-todo-title",
        description: "single-device-todo-desc",
      },
    });
    assert(
      data?.todoUpdate?.__typename === "TodoUpdateSuccess", //
      data?.todoUpdate?.__typename,
    );
  }

  let token2: string;
  {
    const { data } = await tokenRefresh({
      token: token1,
      refreshToken: refreshToken1,
    });
    assert(
      data?.tokenRefresh?.__typename === "TokenRefreshSuccess", //
      data?.tokenRefresh?.__typename,
    );
    token2 = data.tokenRefresh.token;
  }

  {
    const { data } = await todoStatusChange({
      token: token2,
      variables: {
        id: todoId,
        status: TodoStatus.Done,
      },
    });
    assert(
      data?.todoStatusChange?.__typename === "TodoStatusChangeSuccess", //
      data?.todoStatusChange?.__typename,
    );
  }

  await seeders.users(domain.users.admin);

  {
    const before = await Promise.all([
      node({
        token: client.tokens.admin,
        variables: {
          id: userId,
        },
      }),
      node({
        token: client.tokens.admin,
        variables: {
          id: todoId,
        },
      }),
    ]);
    expect(before[0].data?.node).not.toBeNull();
    expect(before[1].data?.node).not.toBeNull();
  }

  {
    const { data } = await accountDelete({
      token: token2,
      variables: {
        password: "password",
      },
    });
    assert(
      data?.accountDelete?.__typename === "AccountDeleteSuccess", //
      data?.accountDelete?.__typename,
    );
  }

  {
    const after = await Promise.all([
      node({
        token: client.tokens.admin,
        variables: {
          id: userId,
        },
      }),
      node({
        token: client.tokens.admin,
        variables: {
          id: todoId,
        },
      }),
    ]);
    expect(after[0].data?.node).toBeNull();
    expect(after[1].data?.node).toBeNull();
  }
});
