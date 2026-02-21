import { clearTables } from "../_shared/helpers.ts";
import {
  executeSingleResultOperation,
  fetchGraphQL,
  getRefreshTokenCookieValue,
} from "./_shared/server.ts";
import type {
  MultiDeviceTodoCreateMutation,
  MultiDeviceTodoCreateMutationVariables,
  MultiDeviceTodoDeleteMutation,
  MultiDeviceTodoDeleteMutationVariables,
  MultiDeviceTodoUpdateMutation,
  MultiDeviceTodoUpdateMutationVariables,
  MultiDeviceTokenRefreshMutation,
  MultiDeviceTokenRefreshMutationVariables,
  MultiDeviceViewerQuery,
  MultiDeviceViewerQueryVariables,
} from "./_shared/types.ts";

const signupHttp = fetchGraphQL(/* GraphQL */ `
  mutation MultiDeviceSignup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      __typename
      ... on SignupSuccess {
        token
      }
    }
  }
`);

const viewer = executeSingleResultOperation<
  MultiDeviceViewerQuery,
  MultiDeviceViewerQueryVariables
>(/* GraphQL */ `
  query MultiDeviceViewer {
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
  MultiDeviceTodoCreateMutation,
  MultiDeviceTodoCreateMutationVariables
>(/* GraphQL */ `
  mutation MultiDeviceTodoCreate($title: String, $description: String) {
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

const loginHttp = fetchGraphQL(/* GraphQL */ `
  mutation MultiDeviceLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      __typename
      ... on LoginSuccess {
        token
      }
    }
  }
`);

const todoUpdate = executeSingleResultOperation<
  MultiDeviceTodoUpdateMutation,
  MultiDeviceTodoUpdateMutationVariables
>(/* GraphQL */ `
  mutation MultiDeviceTodoUpdate(
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
  MultiDeviceTokenRefreshMutation,
  MultiDeviceTokenRefreshMutationVariables
>(/* GraphQL */ `
  mutation MultiDeviceTokenRefresh {
    tokenRefresh {
      __typename
      ... on TokenRefreshSuccess {
        token
      }
    }
  }
`);

const todoDelete = executeSingleResultOperation<
  MultiDeviceTodoDeleteMutation,
  MultiDeviceTodoDeleteMutationVariables
>(/* GraphQL */ `
  mutation MultiDeviceTodoDelete($id: ID!) {
    todoDelete(id: $id) {
      __typename
      ... on TodoDeleteSuccess {
        id
      }
    }
  }
`);

test("multi-device", async () => {
  await clearTables();

  let refreshToken1: string;
  let token1: string;
  {
    const res = await signupHttp({
      variables: {
        name: "multi-device",
        email: "multi-device@example.com",
        password: "password",
      },
    });
    assert(res.ok);
    refreshToken1 = getRefreshTokenCookieValue(res.headers);
    const json = await res.json();
    assert(json.data.signup.__typename === "SignupSuccess", json.data.signup.__typename);
    token1 = json.data.signup.token;
  }

  {
    const { data } = await viewer({
      token: token1,
      refreshToken: refreshToken1,
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("multi-device");
    expect(data.viewer.email).toBe("multi-device@example.com");
    expect(data.viewer.todos?.totalCount).toBe(0);
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
    todoId = data.todoCreate.todo.id;
  }

  let refreshToken2: string;
  let token2: string;
  {
    const res = await loginHttp({
      variables: {
        email: "multi-device@example.com",
        password: "password",
      },
    });
    assert(res.ok);
    refreshToken2 = getRefreshTokenCookieValue(res.headers);
    const json = await res.json();
    assert(json.data.login.token);
    token2 = json.data.login.token;
  }

  {
    const { data } = await viewer({
      token: token2,
      refreshToken: refreshToken2,
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("multi-device");
    expect(data.viewer.email).toBe("multi-device@example.com");
    expect(data.viewer.todos?.totalCount).toBe(1);
  }

  {
    const { data } = await todoUpdate({
      token: token2,
      refreshToken: refreshToken2,
      variables: {
        id: todoId,
        title: "multi-device-todo-title",
        description: "multi-device-todo-desc",
      },
    });
    assert(
      data?.todoUpdate?.__typename === "TodoUpdateSuccess", //
      data?.todoUpdate?.__typename,
    );
  }

  let token1_2: string;
  {
    const { data } = await tokenRefresh({
      token: token1,
      refreshToken: refreshToken1,
    });
    assert(
      data?.tokenRefresh?.__typename === "TokenRefreshSuccess", //
      data?.tokenRefresh?.__typename,
    );
    token1_2 = data.tokenRefresh.token;
  }

  {
    const { data } = await todoDelete({
      token: token1_2,
      variables: {
        id: todoId,
      },
    });
    assert(
      data?.todoDelete?.__typename === "TodoDeleteSuccess", //
      data?.todoDelete?.__typename,
    );
  }

  {
    const { data } = await viewer({
      token: token1_2,
      refreshToken: refreshToken1,
    });
    assert(data?.viewer);
    expect(data.viewer.todos?.totalCount).toBe(0);
  }

  let token2_2: string;
  {
    const { data } = await tokenRefresh({
      token: token2,
      refreshToken: refreshToken2,
    });
    assert(
      data?.tokenRefresh?.__typename === "TokenRefreshSuccess", //
      data?.tokenRefresh?.__typename,
    );
    token2_2 = data.tokenRefresh.token;
  }

  {
    const { data } = await viewer({
      token: token2_2,
    });
    assert(data?.viewer);
    expect(data.viewer.todos?.totalCount).toBe(0);
  }
});
