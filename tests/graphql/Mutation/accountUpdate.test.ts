import { client, domain, graph } from "../../data.ts";
import { clearTables, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type {
  AccountUpdateMutation,
  AccountUpdateMutationVariables,
  AccountUpdateNodeQuery,
  AccountUpdateNodeQueryVariables,
} from "../_schema.ts";

const accountUpdate = executeSingleResultOperation<
  AccountUpdateMutation,
  AccountUpdateMutationVariables
>(/* GraphQL */ `
  mutation AccountUpdate($name: String) {
    accountUpdate(name: $name) {
      __typename
      ... on AccountUpdateSuccess {
        user {
          id
          name
          email
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
  AccountUpdateNodeQuery, //
  AccountUpdateNodeQueryVariables
>(/* GraphQL */ `
  query AccountUpdateNode($id: ID!) {
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
  }

  // act
  {
    const { data } = await accountUpdate({
      token: client.tokens.alice,
      variables: { name: "" },
    });
    assert(
      data?.accountUpdate?.__typename === "InvalidInputErrors",
      data?.accountUpdate?.__typename,
    );
    expect(data.accountUpdate.errors.map((error) => error.field)).toStrictEqual(["name"]);
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

it("updates the account", async () => {
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
    const { data } = await accountUpdate({
      token: client.tokens.alice,
      variables: { name: "foo" },
    });
    assert(
      data?.accountUpdate?.__typename === "AccountUpdateSuccess",
      data?.accountUpdate?.__typename,
    );
    expect(data.accountUpdate.user.id).toBe(graph.users.alice.id);
    expect(data.accountUpdate.user.name).toBe("foo");
    expect(Date.parse(data.accountUpdate.user.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.users.alice.updatedAt),
    );
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(alice.data?.node?.__typename === "User", alice.data?.node?.__typename);
    expect(alice.data.node.id).toBe(graph.users.alice.id);
    expect(alice.data.node.name).toBe("foo");
    expect(alice.data.node.email).toBe(graph.users.alice.email);
    expect(alice.data.node.createdAt).toBe(graph.users.alice.createdAt);
    expect(Date.parse(alice.data.node.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.users.alice.updatedAt),
    );
  }
});

it("updates only updatedAt when input is empty", async () => {
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
    const { data } = await accountUpdate({
      token: client.tokens.alice,
      variables: {},
    });
    assert(
      data?.accountUpdate?.__typename === "AccountUpdateSuccess",
      data?.accountUpdate?.__typename,
    );
    expect(data.accountUpdate.user.id).toBe(graph.users.alice.id);
    expect(data.accountUpdate.user.name).toBe(graph.users.alice.name);
    expect(Date.parse(data.accountUpdate.user.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.users.alice.updatedAt),
    );
  }

  // postcondition
  {
    const alice = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    assert(alice.data?.node?.__typename === "User", alice.data?.node?.__typename);
    expect(alice.data.node.id).toBe(graph.users.alice.id);
    expect(alice.data.node.name).toBe(graph.users.alice.name);
    expect(alice.data.node.email).toBe(graph.users.alice.email);
    expect(alice.data.node.createdAt).toBe(graph.users.alice.createdAt);
    expect(Date.parse(alice.data.node.updatedAt!)).toBeGreaterThan(
      Date.parse(graph.users.alice.updatedAt),
    );
  }
});
