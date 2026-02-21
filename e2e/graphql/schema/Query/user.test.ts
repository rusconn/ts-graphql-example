import { ErrorCode } from "../../../src/presentation/graphql/_schema.ts";

import { client, domain, graph } from "../../../_shared/data.ts";
import { clearTables, dummyId, seed } from "../../../_shared/helpers.ts";
import { executeSingleResultOperation } from "../../_shared/server.ts";
import type { UserQuery, UserQueryVariables } from "../_types.ts";

const user = executeSingleResultOperation<
  UserQuery, //
  UserQueryVariables
>(/* GraphQL */ `
  query User($id: ID!) {
    user(id: $id) {
      id
    }
  }
`);

beforeAll(async () => {
  await clearTables();
  await seed.users(domain.users.admin, domain.users.alice);
});

it("returns an error when id is invalid", async () => {
  const { data, errors } = await user({
    token: client.tokens.admin,
    variables: { id: "abracadabra" },
  });

  expect(data?.user).toBeNull();
  expect(errors?.map((e) => e.extensions.code)).toStrictEqual([ErrorCode.BadUserInput]);
});

it("returns null when id not exists on graph", async () => {
  const { data, errors } = await user({
    token: client.tokens.admin,
    variables: { id: dummyId.todo() },
  });

  expect(data?.user).toBeNull();
  expect(errors).toBeUndefined();
});

it("returns user", async () => {
  const { data, errors } = await user({
    token: client.tokens.admin,
    variables: { id: graph.users.alice.id },
  });

  expect(data?.user).not.toBeNull();
  expect(errors).toBeUndefined();
});
