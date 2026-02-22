import { clearTables } from "../_shared/helpers.ts";
import { executeSingleResultOperation } from "./_shared/server.ts";
import type {
  LogoutLoginLoginMutation,
  LogoutLoginLoginMutationVariables,
  LogoutLoginLoginPasswordChangeMutation,
  LogoutLoginLoginPasswordChangeMutationVariables,
  LogoutLoginLogoutMutation,
  LogoutLoginLogoutMutationVariables,
  LogoutLoginSignupMutation,
  LogoutLoginSignupMutationVariables,
  LogoutLoginUserEmailChangeMutation,
  LogoutLoginUserEmailChangeMutationVariables,
  LogoutLoginViewerQuery,
  LogoutLoginViewerQueryVariables,
} from "./_shared/types.ts";

const signup = executeSingleResultOperation<
  LogoutLoginSignupMutation,
  LogoutLoginSignupMutationVariables
>(/* GraphQL */ `
  mutation LogoutLoginSignup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      __typename
      ... on SignupSuccess {
        token
      }
    }
  }
`);

const userEmailChange = executeSingleResultOperation<
  LogoutLoginUserEmailChangeMutation,
  LogoutLoginUserEmailChangeMutationVariables
>(/* GraphQL */ `
  mutation LogoutLoginUserEmailChange($email: String!) {
    userEmailChange(email: $email) {
      __typename
      ... on UserEmailChangeSuccess {
        user {
          id
        }
      }
    }
  }
`);

const loginPasswordChange = executeSingleResultOperation<
  LogoutLoginLoginPasswordChangeMutation,
  LogoutLoginLoginPasswordChangeMutationVariables
>(/* GraphQL */ `
  mutation LogoutLoginLoginPasswordChange($oldPassword: String!, $newPassword: String!) {
    loginPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {
      __typename
      ... on LoginPasswordChangeSuccess {
        user {
          id
        }
      }
    }
  }
`);

const logout = executeSingleResultOperation<
  LogoutLoginLogoutMutation,
  LogoutLoginLogoutMutationVariables
>(/* GraphQL */ `
  mutation LogoutLoginLogout {
    logout
  }
`);

const login = executeSingleResultOperation<
  LogoutLoginLoginMutation,
  LogoutLoginLoginMutationVariables
>(/* GraphQL */ `
  mutation LogoutLoginLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      __typename
      ... on LoginSuccess {
        token
      }
    }
  }
`);

const viewer = executeSingleResultOperation<
  LogoutLoginViewerQuery,
  LogoutLoginViewerQueryVariables
>(/* GraphQL */ `
  query LogoutLoginViewer {
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

test("logout-login", async () => {
  await clearTables();

  let token1: string;
  {
    const { data } = await signup({
      variables: {
        name: "logout-login",
        email: "logout-login@example.com",
        password: "password",
      },
    });
    assert(
      data?.signup?.__typename === "SignupSuccess", //
      data?.signup?.__typename,
    );
    token1 = data.signup.token;
  }

  {
    const { data } = await viewer({
      token: token1,
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("logout-login");
    expect(data.viewer.email).toBe("logout-login@example.com");
  }

  {
    const { data } = await userEmailChange({
      token: token1,
      variables: {
        email: "logout-login-2@example.com",
      },
    });
    assert(
      data?.userEmailChange?.__typename === "UserEmailChangeSuccess",
      data?.userEmailChange?.__typename,
    );
  }

  {
    const { data } = await loginPasswordChange({
      token: token1,
      variables: {
        oldPassword: "password",
        newPassword: "password-2",
      },
    });
    assert(
      data?.loginPasswordChange?.__typename === "LoginPasswordChangeSuccess",
      data?.loginPasswordChange?.__typename,
    );
  }

  {
    const { errors } = await logout({
      token: token1,
    });
    expect(errors).toBeUndefined();
  }

  let token2: string;
  {
    const { data } = await login({
      token: token1,
      variables: {
        email: "logout-login-2@example.com",
        password: "password-2",
      },
    });
    assert(
      data?.login?.__typename === "LoginSuccess", //
      data?.login?.__typename,
    );
    token2 = data.login.token;
  }

  {
    const { data } = await viewer({
      token: token2, // new token
    });
    assert(data?.viewer);
    expect(data.viewer.name).toBe("logout-login");
    expect(data.viewer.email).toBe("logout-login-2@example.com");
  }
});
