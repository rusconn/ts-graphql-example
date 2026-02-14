import * as Domain from "../../../src/domain/entities.ts";
import type * as Db from "../../../src/infra/datasources/_shared/types.ts";

import { db, client, domain, graph } from "../../data.ts";
import { clearTables, queries, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type {
  LoginMutation,
  LoginMutationVariables,
  LoginNodeQuery,
  LoginNodeQueryVariables,
} from "../_schema.ts";

const login = executeSingleResultOperation<
  LoginMutation, //
  LoginMutationVariables
>(/* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
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

const node = executeSingleResultOperation<
  LoginNodeQuery, //
  LoginNodeQueryVariables
>(/* GraphQL */ `
  query LoginNode($id: ID!) {
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
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(0);
  }

  // act
  {
    const { data } = await login({
      variables: {
        email: "emailexample.com", // invalid
        password: "alice", // invalid
      },
    });
    assert(data?.login?.__typename === "InvalidInputErrors", data?.login?.__typename);
    expect(data.login.errors.map((error) => error.field).sort()).toStrictEqual([
      "email",
      "password",
    ]);
  }

  // postcondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(0);
  }
});

it("returns an error when email is incorrect", async () => {
  // precondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(0);
  }

  // act
  {
    const { data } = await login({
      variables: {
        email: "incorrect@example.com",
        password: "alicealice",
      },
    });
    assert(data?.login?.__typename === "LoginFailedError", data?.login?.__typename);
    expect(data.login.message).toBe("Incorrect email or password."); // don't tell which one is incorrect
  }

  // postcondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(0);
  }
});

it("returns an error when password is incorrect", async () => {
  // precondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(0);
  }

  // act
  {
    const { data } = await login({
      variables: {
        email: domain.users.alice.email,
        password: "incorrect",
      },
    });
    assert(data?.login?.__typename === "LoginFailedError", data?.login?.__typename);
    expect(data.login.message).toBe("Incorrect email or password."); // don't tell which one is incorrect
  }

  // postcondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(0);
  }
});

it("returns a new token and adds a refresh token", async () => {
  // precondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(0);

    const oldToken = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(oldToken.data?.node).toStrictEqual(graph.users.alice);

    const noToken = await node({
      variables: { id: graph.users.alice.id },
    });
    expect(noToken.data?.node).toBeNull();
  }

  // act
  let aliceToken: string;
  {
    const { data } = await login({
      variables: {
        email: domain.users.alice.email,
        password: "alicealice",
      },
    });
    assert(data?.login?.__typename === "LoginSuccess", data?.login?.__typename);
    aliceToken = data.login.token;
  }

  // postcondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(1);

    const oldToken = await node({
      token: client.tokens.alice,
      variables: { id: graph.users.alice.id },
    });
    expect(oldToken.data?.node).toStrictEqual(graph.users.alice);

    const newToken = await node({
      token: aliceToken,
      variables: { id: graph.users.alice.id },
    });
    expect(newToken.data?.node).toStrictEqual(graph.users.alice);
  }
});

it("retains latest 5 refresh tokens", async () => {
  // seed
  {
    const dbRefreshTokens = Array.from({ length: 5 }).map((_, i) => ({
      token: `$2b$04$UJnbSNtlTFcLZkRtPqx2SOswuES4NFkKjP1rV9pb.SP037OP0ru/${i}`,
      userId: db.users.alice.id,
      lastUsedAt: new Date(`2026-01-01T00:00:00.00${i}Z`),
    })) satisfies Db.NewRefreshToken[];
    const refreshTokens = dbRefreshTokens.map(Domain.RefreshToken.parseOrThrow);
    await seed.refreshTokens(...refreshTokens);
  }

  // precondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(5);
  }

  // act
  {
    const { data } = await login({
      variables: {
        email: domain.users.alice.email,
        password: "alicealice",
      },
    });
    assert(data?.login?.__typename === "LoginSuccess", data?.login?.__typename);
  }

  // postcondition
  {
    const aliceTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(aliceTokens.length).toBe(5);
    expect(aliceTokens.sort()[0]!.token).toBe(
      `$2b$04$UJnbSNtlTFcLZkRtPqx2SOswuES4NFkKjP1rV9pb.SP037OP0ru/${1}`,
    );
  }
});
