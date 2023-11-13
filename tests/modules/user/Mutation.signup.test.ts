import { describe, test, it, expect, beforeAll, beforeEach } from "vitest";

import type { SignupMutation, SignupMutationVariables } from "tests/modules/schema.js";
import { ContextData, DBData } from "tests/data/mod.js";
import { clearUsers, fail } from "tests/helpers.js";
import { executeSingleResultOperation } from "tests/server.js";
import { prisma } from "@/prisma/mod.js";
import * as Prisma from "@/prisma/mod.js";
import * as Graph from "@/modules/common/schema.js";
import { parseUserNodeId } from "@/modules/user/common/parser.js";

const executeMutation = executeSingleResultOperation<
  SignupMutation,
  SignupMutationVariables
>(/* GraphQL */ `
  mutation Signup($input: SignupInput!) {
    signup(input: $input) {
      __typename
      ... on SignupSuccess {
        id
      }
      ... on EmailAlreadyTakenError {
        message
      }
    }
  }
`);

const testData = {
  users: [DBData.admin, DBData.alice, DBData.bob],
};

const seedData = {
  users: () => prisma.user.createMany({ data: testData.users }),
};

const resetUsers = async () => {
  await clearUsers();
  await seedData.users();
};

beforeAll(resetUsers);

describe("authorization", () => {
  const variables = {
    input: {
      name: "foo",
      email: "guest@guest.com",
      password: "password",
    },
  };

  test("not AuthorizationError -> not Forbidden", async () => {
    const { data, errors } = await executeMutation({
      user: ContextData.guest,
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.signup).not.toBeNull();
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { data, errors } = await executeMutation({
      user: ContextData.alice,
      variables,
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.signup).toBeNull();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  const nameMax = 100;
  const validInput = { name: "name", email: "email@email.com", password: "password" };

  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { ...validInput } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { ...validInput, name: "A".repeat(nameMax + 1) } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

describe("logic", () => {
  beforeEach(resetUsers);

  test("email already exists", async () => {
    const name = "foo";
    const { email } = DBData.admin;
    const password = "password";

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    expect(data?.signup?.__typename).toBe("EmailAlreadyTakenError");
  });

  it("should create user using input", async () => {
    const name = "foo";
    const email = "foo@foo.com";
    const password = "password";

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    if (data?.signup?.__typename !== "SignupSuccess") {
      fail();
    }

    const id = parseUserNodeId(data.signup.id);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });

    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
  });

  test("role should be USER by default", async () => {
    const name = "bar";
    const email = "bar@bar.com";
    const password = "password";

    const { data } = await executeMutation({
      user: ContextData.guest,
      variables: { input: { name, email, password } },
    });

    if (data?.signup?.__typename !== "SignupSuccess") {
      fail();
    }

    const id = parseUserNodeId(data.signup.id);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });

    expect(user.role).toBe(Prisma.Role.USER);
  });
});
