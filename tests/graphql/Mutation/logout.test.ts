import { client, domain } from "../../data.ts";
import { clearTables, queries, seed } from "../../helpers.ts";
import { executeSingleResultOperation } from "../../server.ts";
import type { LogoutMutation, LogoutMutationVariables } from "../_schema.ts";

const logout = executeSingleResultOperation<
  LogoutMutation, //
  LogoutMutationVariables
>(/* GraphQL */ `
  mutation Logout {
    logout
  }
`);

beforeEach(async () => {
  await clearTables();
  await seed.users(domain.users.alice);
  await seed.refreshTokens(domain.refreshTokens.alice);
});

it("succeeds when refresh token is invalid", async () => {
  // precondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }

  // act
  await logout({
    token: client.tokens.alice,
    refreshToken: "abracadabra",
  });

  // postcondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }
});

it("succeeds when refresh token not specified", async () => {
  // precondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }

  // act
  await logout({
    token: client.tokens.alice,
  });

  // postcondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }
});

it("succeeds when refresh token is incorrect", async () => {
  // precondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }

  // act
  await logout({
    token: client.tokens.alice,
    refreshToken: "00008ce5-82cd-418c-9a72-4c43cfa30000",
  });

  // postcondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }
});

it("deletes the refresh token", async () => {
  // precondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(1);
  }

  // act
  await logout({
    token: client.tokens.alice,
    refreshToken: "a5ef8ce5-82cd-418c-9a72-4c43cfa30c9c",
  });

  // postcondition
  {
    const refreshTokens = await queries.refreshToken.find(domain.users.alice.id);
    expect(refreshTokens.length).toBe(0);
  }
});
