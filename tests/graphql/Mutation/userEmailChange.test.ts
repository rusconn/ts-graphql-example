import { domain, client, graph } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type {
  UserEmailChangeMutation,
  UserEmailChangeMutationVariables,
  UserEmailChangeNodeQuery,
  UserEmailChangeNodeQueryVariables,
} from "../_schema.ts";

const userEmailChange = executeSingleResultOperation<
  UserEmailChangeMutation,
  UserEmailChangeMutationVariables
>(/* GraphQL */ `
  mutation UserEmailChange($email: String!) {
    userEmailChange(email: $email) {
      __typename
      ... on UserEmailChangeSuccess {
        user {
          id
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
  UserEmailChangeNodeQuery,
  UserEmailChangeNodeQueryVariables
>(/* GraphQL */ `
  query UserEmailChangeNode($id: ID!) {
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
  await seed.users(domain.users.alice, domain.users.admin);
});

it("returns validation errors when input is invalid", async () => {
  // precondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);
  }

  // act
  {
    const { data } = await userEmailChange({
      token: client.tokens.alice,
      variables: {
        email: "aliceexample.com", // invalid
      },
    });
    assert(
      data?.userEmailChange?.__typename === "InvalidInputErrors",
      data?.userEmailChange?.__typename,
    );
    expect(data.userEmailChange.errors.map((error) => error.field)).toStrictEqual(["email"]);
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);
  }
});

it("returns an error when email is already taken", async () => {
  // precondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);
  }

  // act
  {
    const { data } = await userEmailChange({
      token: client.tokens.alice,
      variables: {
        email: domain.users.admin.email, // taken
      },
    });
    assert(
      data?.userEmailChange?.__typename === "EmailAlreadyTakenError",
      data?.userEmailChange?.__typename,
    );
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);
  }
});

it("changes the user's email", async () => {
  // precondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node).toStrictEqual(graph.users.alice);
  }

  // act
  {
    const { data } = await userEmailChange({
      token: client.tokens.alice,
      variables: {
        email: "alice2@example.com",
      },
    });
    assert(
      data?.userEmailChange?.__typename === "UserEmailChangeSuccess",
      data?.userEmailChange?.__typename,
    );
    expect(data.userEmailChange.user.id).toBe(graph.users.alice.id);
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(alice.data?.node?.__typename === "User", alice.data?.node?.__typename);
    expect(alice.data?.node.id).toBe(graph.users.alice.id);
    expect(alice.data?.node.name).toBe(graph.users.alice.name);
    expect(alice.data?.node.email).toBe("alice2@example.com");
    expect(alice.data?.node.createdAt).toBe(graph.users.alice.createdAt);
    expect(Date.parse(alice.data.node.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.users.alice.updatedAt),
    );
  }
});
