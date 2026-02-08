import { client, domain, graph } from "../../data.ts";
import { clearTables, queries, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type {
  LoginPasswordChangeLoginMutation,
  LoginPasswordChangeLoginMutationVariables,
  LoginPasswordChangeMutation,
  LoginPasswordChangeMutationVariables,
  LoginPasswordChangeNodeQuery,
  LoginPasswordChangeNodeQueryVariables,
} from "../_schema.ts";

const loginPasswordChange = executeSingleResultOperation<
  LoginPasswordChangeMutation,
  LoginPasswordChangeMutationVariables
>(/* GraphQL */ `
  mutation LoginPasswordChange($oldPassword: String!, $newPassword: String!) {
    loginPasswordChange(oldPassword: $oldPassword, newPassword: $newPassword) {
      __typename
      ... on LoginPasswordChangeSuccess {
        id
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

const login = executeSingleResultOperation<
  LoginPasswordChangeLoginMutation,
  LoginPasswordChangeLoginMutationVariables
>(/* GraphQL */ `
  mutation LoginPasswordChangeLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      __typename
    }
  }
`);

const node = executeSingleResultOperation<
  LoginPasswordChangeNodeQuery,
  LoginPasswordChangeNodeQueryVariables
>(/* GraphQL */ `
  query LoginPasswordChangeNode($id: ID!) {
    node(id: $id) {
      __typename
      id
      ... on User {
        name
        email
        createdAt
        updatedAt
      }
    }
  }
`);

beforeEach(async () => {
  await clearTables();
  await seed.users(domain.users.alice);
});

it("returns validation errors when input is invalid", async () => {
  // precondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).toBe(domain.users.alice.password);
  }

  // act
  {
    const { data } = await loginPasswordChange({
      token: client.tokens.alice,
      variables: {
        oldPassword: "alice",
        newPassword: "pass",
      },
    });
    assert(
      data?.loginPasswordChange?.__typename === "InvalidInputErrors",
      data?.loginPasswordChange?.__typename,
    );
    expect(data.loginPasswordChange.errors.map((error) => error.field).sort()).toStrictEqual([
      "newPassword",
      "oldPassword",
    ]);
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).toBe(domain.users.alice.password);
  }
});

it("returns an error when passwords are the same", async () => {
  // precondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).toBe(domain.users.alice.password);
  }

  // act
  {
    const { data } = await loginPasswordChange({
      token: client.tokens.alice,
      variables: {
        oldPassword: "alicealice",
        newPassword: "alicealice",
      },
    });
    assert(
      data?.loginPasswordChange?.__typename === "SamePasswordsError",
      data?.loginPasswordChange?.__typename,
    );
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).toBe(domain.users.alice.password);
  }
});

it("returns an error when old passwords is incorrect", async () => {
  // precondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).toBe(domain.users.alice.password);
  }

  // act
  {
    const { data } = await loginPasswordChange({
      token: client.tokens.alice,
      variables: {
        oldPassword: "abracadabra",
        newPassword: "newpassword",
      },
    });
    assert(
      data?.loginPasswordChange?.__typename === "IncorrectOldPasswordError",
      data?.loginPasswordChange?.__typename,
    );
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).toBe(domain.users.alice.password);
  }
});

it("changes password", async () => {
  // precondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).toBe(domain.users.alice.password);

    const currentPassword = await login({
      token: client.tokens.alice,
      variables: {
        email: domain.users.alice.email,
        password: "alicealice",
      },
    });
    assert(
      currentPassword.data?.login?.__typename === "LoginSuccess",
      currentPassword.data?.login?.__typename,
    );
  }

  // act
  {
    const { data } = await loginPasswordChange({
      token: client.tokens.alice,
      variables: {
        oldPassword: "alicealice",
        newPassword: "newpassword",
      },
    });
    assert(
      data?.loginPasswordChange?.__typename === "LoginPasswordChangeSuccess",
      data?.loginPasswordChange?.__typename,
    );
    expect(data.loginPasswordChange.id).toBe(graph.users.alice.id);
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(alice.data?.node?.__typename === "User", alice.data?.node?.__typename);
    expect(Date.parse(alice.data.node.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.users.alice.updatedAt),
    );

    const aliceCredential = await queries.credential.findByEmail(domain.users.alice.email);
    expect(aliceCredential?.password).not.toBe(domain.users.alice.password);

    const oldPassword = await login({
      token: client.tokens.alice,
      variables: {
        email: domain.users.alice.email,
        password: "alicealice",
      },
    });
    assert(
      oldPassword.data?.login?.__typename === "LoginFailedError",
      oldPassword.data?.login?.__typename,
    );

    const newPassword = await login({
      token: client.tokens.alice,
      variables: {
        email: domain.users.alice.email,
        password: "newpassword",
      },
    });
    assert(
      newPassword.data?.login?.__typename === "LoginSuccess",
      newPassword.data?.login?.__typename,
    );
  }
});
