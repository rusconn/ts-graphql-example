import { client, domain, graph } from "../../../../data.ts";
import { clearTables, seed } from "../../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type {
  AccountDeleteMutation,
  AccountDeleteMutationVariables,
  AccountDeleteNodeQuery,
  AccountDeleteNodeQueryVariables,
} from "../_types.ts";

const accountDelete = executeSingleResultOperation<
  AccountDeleteMutation,
  AccountDeleteMutationVariables
>(/* GraphQL */ `
  mutation AccountDelete {
    accountDelete {
      __typename
      ... on AccountDeleteSuccess {
        id
      }
    }
  }
`);

const node = executeSingleResultOperation<
  AccountDeleteNodeQuery, //
  AccountDeleteNodeQueryVariables
>(/* GraphQL */ `
  query AccountDeleteNode($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

beforeEach(async () => {
  await clearTables();
  await seed.users(domain.users.alice, domain.users.admin);
  await seed.todos(domain.todos.alice1);
});

it("deletes user and resources", async () => {
  const queryNodes = () =>
    Promise.all([
      node({
        token: client.tokens.admin,
        variables: { id: graph.users.alice.id },
      }),
      node({
        token: client.tokens.admin,
        variables: { id: graph.todos.alice1.id },
      }),
    ]);

  // precondition
  {
    const [alice, aliceTodo] = await queryNodes();
    expect(alice.data?.node).not.toBeNull();
    expect(aliceTodo.data?.node).not.toBeNull();
  }

  // act
  {
    const { data } = await accountDelete({
      token: client.tokens.alice,
    });
    assert(
      data?.accountDelete?.__typename === "AccountDeleteSuccess",
      data?.accountDelete?.__typename,
    );
    expect(data.accountDelete.id).toBe(graph.users.alice.id);
  }

  // postcondition
  {
    const [alice, aliceTodo] = await queryNodes();
    expect(alice.data?.node).toBeNull();
    expect(aliceTodo.data?.node).toBeNull();
  }
});
