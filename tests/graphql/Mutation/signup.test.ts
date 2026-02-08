import { ErrorCode } from "../../../src/graphql/_schema.ts";
import { client, domain } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type {
  SignupLoginMutation,
  SignupLoginMutationVariables,
  SignupMutation,
  SignupMutationVariables,
  SignupUsersQuery,
  SignupUsersQueryVariables,
} from "../_schema.ts";

const signup = executeSingleResultOperation<
  SignupMutation, //
  SignupMutationVariables
>(/* GraphQL */ `
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      __typename
      ... on SignupSuccess {
        token
      }
      ... on InvalidInputErrors {
        errors {
          field
        }
      }
    }
  }
`);

const login = executeSingleResultOperation<
  SignupLoginMutation, //
  SignupLoginMutationVariables
>(/* GraphQL */ `
  mutation SignupLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      __typename
      ... on LoginSuccess {
        token
      }
      ... on InvalidInputErrors {
        errors {
          field
        }
      }
      ... on LoginFailedError {
        message
      }
    }
  }
`);

const users = executeSingleResultOperation<
  SignupUsersQuery, //
  SignupUsersQueryVariables
>(/* GraphQL */ `
  query SignupUsers {
    users(first: 30) {
      totalCount
    }
  }
`);

beforeEach(async () => {
  await clearTables();
  await seed.users(domain.users.admin);
});

it("returns validation errors when input is invalid", async () => {
  // precondition
  {
    const users_ = await users({
      token: client.tokens.admin,
    });
    expect(users_.data?.users?.totalCount).toBe(1);
  }

  // act
  {
    const { data } = await signup({
      variables: {
        name: "", // invalid
        email: "example.com", // invalid
        password: "pass", // invalid,
      },
    });
    assert(data?.signup?.__typename === "InvalidInputErrors", data?.signup?.__typename);
    expect(data.signup.errors.map((e) => e.field).sort()).toStrictEqual([
      "email",
      "name",
      "password",
    ]);
  }

  // postcondition
  {
    const users_ = await users({
      token: client.tokens.admin,
    });
    expect(users_.data?.users?.totalCount).toBe(1);
  }
});

it("returns an error when email is already taken", async () => {
  // precondition
  {
    const users_ = await users({
      token: client.tokens.admin,
    });
    expect(users_.data?.users?.totalCount).toBe(1);
  }

  // act
  {
    const { data } = await signup({
      variables: {
        name: "foobar",
        email: domain.users.admin.email, // taken
        password: "password",
      },
    });
    assert(data?.signup?.__typename === "EmailAlreadyTakenError", data?.signup?.__typename);
  }

  // postcondition
  {
    const users_ = await users({
      token: client.tokens.admin,
    });
    expect(users_.data?.users?.totalCount).toBe(1);
  }
});

it("creates a user and returns a new token", async () => {
  // precondition
  {
    const users_ = await users({
      token: client.tokens.admin,
    });
    expect(users_.data?.users?.totalCount).toBe(1);

    const login_ = await login({
      variables: {
        email: "foo@example.com",
        password: "password",
      },
    });
    assert(login_.data?.login?.__typename === "LoginFailedError", login_.data?.login?.__typename);
  }

  // act
  {
    const { data } = await signup({
      variables: {
        name: "foo",
        email: "foo@example.com",
        password: "password",
      },
    });
    assert(data?.signup?.__typename === "SignupSuccess", data?.signup?.__typename);
  }

  // postcondition
  {
    const usersByAdmin = await users({
      token: client.tokens.admin,
    });
    expect(usersByAdmin.data?.users?.totalCount).toBe(2);

    const login_ = await login({
      variables: {
        email: "foo@example.com",
        password: "password",
      },
    });
    assert(login_.data?.login?.__typename === "LoginSuccess", login_.data?.login?.__typename);

    const usersByNewUser = await users({
      token: login_.data.login.token,
    });
    expect(usersByNewUser.data?.users).toBeNull();
    expect(usersByNewUser.errors?.map((e) => e.extensions.code)).toStrictEqual([
      ErrorCode.Forbidden,
    ]);
  }
});
