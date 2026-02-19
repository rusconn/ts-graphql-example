import { ErrorCode } from "../../../../../src/presentation/graphql/schema/_types.ts";

import { client, domain, graph } from "../../../../data.ts";
import { clearTables, queries, seed } from "../../../../helpers.ts";
import { executeSingleResultOperation } from "../../../server.ts";
import type {
  TokenRefreshMutation,
  TokenRefreshMutationVariables,
  TokenRefreshNodeQuery,
  TokenRefreshNodeQueryVariables,
} from "../_types.ts";

const tokenRefresh = executeSingleResultOperation<
  TokenRefreshMutation,
  TokenRefreshMutationVariables
>(/* GraphQL */ `
  mutation TokenRefresh {
    tokenRefresh {
      __typename
      ... on TokenRefreshSuccess {
        token
      }
    }
  }
`);

const node = executeSingleResultOperation<
  TokenRefreshNodeQuery, //
  TokenRefreshNodeQueryVariables
>(/* GraphQL */ `
  query TokenRefreshNode($id: ID!) {
    node(id: $id) {
      id
    }
  }
`);

beforeEach(async () => {
  await clearTables();
  await seed.users(domain.users.alice);
  await seed.refreshTokens(domain.refreshTokens.alice);
});

it("returns an error when no refresh token passed", async () => {
  // precondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }

  // act
  {
    const { data, errors } = await tokenRefresh({
      token: client.tokens.alice,
    });
    expect(data?.tokenRefresh).toBeNull();
    expect(errors?.map((e) => e.extensions.code)).toStrictEqual([ErrorCode.BadUserInput]);
  }

  // postcondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }
});

it("returns a valition error when refresh is invalid", async () => {
  // precondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }

  // act
  {
    const { data } = await tokenRefresh({
      token: client.tokens.alice,
      refreshToken: "abracadabra",
    });
    assert(
      data?.tokenRefresh?.__typename === "InvalidRefreshTokenError",
      data?.tokenRefresh?.__typename,
    );
  }

  // postcondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }
});

it("refreshes token and updates refresh token timestamp", async () => {
  // precondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
    expect(refreshTokens[0]!.createdAt).toEqual(domain.refreshTokens.alice.createdAt);
  }

  // act
  let aliceToken: string;
  {
    const { data } = await tokenRefresh({
      token: client.tokens.alice,
      refreshToken: client.refreshTokens.alice,
    });
    assert(
      data?.tokenRefresh?.__typename === "TokenRefreshSuccess",
      data?.tokenRefresh?.__typename,
    );
    expect(client.tokens.alice).not.toBe(data.tokenRefresh.token);
    aliceToken = data.tokenRefresh.token;
  }

  // postcondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
    expect(refreshTokens[0]!.createdAt.getTime()).toBeGreaterThan(
      domain.refreshTokens.alice.createdAt.getTime(),
    );

    const alice = await node({
      token: aliceToken,
      variables: { id: graph.users.alice.id },
    });
    expect(alice.data?.node?.id).toBe(graph.users.alice.id);
  }
});
