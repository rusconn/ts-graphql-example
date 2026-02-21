import { ErrorCode } from "../../../src/presentation/graphql/_schema.ts";

import { client, domain, graph } from "../../../_shared/data.ts";
import { clearTables, dummyId, seed } from "../../../_shared/helpers.ts";
import { executeSingleResultOperation } from "../../_shared/server.ts";
import type { NodeQuery, NodeQueryVariables } from "../_types.ts";

const node = executeSingleResultOperation<
  NodeQuery, //
  NodeQueryVariables
>(/* GraphQL */ `
  query Node($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

beforeAll(async () => {
  await clearTables();
  await seed.users(domain.users.alice, domain.users.admin);
  await seed.todos(domain.todos.alice1, domain.todos.admin1);
});

it("returns an error when id is invalid", async () => {
  const { data, errors } = await node({
    token: client.tokens.alice,
    variables: { id: "abracadabra" },
  });

  expect(data?.node).toBeNull();
  expect(errors?.map((e) => e.extensions.code)).toStrictEqual([ErrorCode.BadUserInput]);
});

it("returns null when id not exists on graph", async () => {
  const { data, errors } = await node({
    token: client.tokens.alice,
    variables: { id: dummyId.todo() },
  });

  expect(data?.node).toBeNull();
  expect(errors).toBeUndefined();
});

it("returns null when client does not own node", async () => {
  const { data, errors } = await node({
    token: client.tokens.alice,
    variables: { id: graph.todos.admin1.id },
  });

  expect(data?.node).toBeNull();
  expect(errors).toBeUndefined();
});

it("returns node", async () => {
  const { data, errors } = await node({
    token: client.tokens.alice,
    variables: { id: graph.users.alice.id },
  });

  expect(data?.node).not.toBeNull();
  expect(errors).toBeUndefined();
});
