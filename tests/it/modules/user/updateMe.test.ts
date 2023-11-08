import omit from "lodash/omit";

import type { UpdateMeMutation, UpdateMeMutationVariables } from "it/modules/schema";
import { ContextData, DBData } from "it/data";
import { clearUsers } from "it/helpers";
import { executeSingleResultOperation } from "it/server";
import { prisma } from "@/prisma";
import * as Graph from "@/modules/common/schema";

const executeMutation = executeSingleResultOperation(/* GraphQL */ `
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      __typename
      ... on UpdateMeSuccess {
        user {
          id
          name
          email
          updatedAt
        }
      }
      ... on EmailAlreadyTakenError {
        message
      }
    }
  }
`)<UpdateMeMutation, UpdateMeMutationVariables>;

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
  const input = { name: "foo" };

  test("not AuthorizationError -> not Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.alice,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test("AuthorizationError -> Forbidden", async () => {
    const { errors } = await executeMutation({
      user: ContextData.guest,
      variables: { input },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});

describe("validation", () => {
  test("not ParseError -> not BadUserInput", async () => {
    const { errors } = await executeMutation({
      variables: { input: { name: "name" } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });

  test("ParseError -> BadUserInput", async () => {
    const { errors } = await executeMutation({
      variables: { input: { name: null } },
    });

    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.BadUserInput]));
  });
});

describe("logic", () => {
  beforeEach(resetUsers);

  test("email already exists", async () => {
    const { email } = DBData.alice;

    const { data } = await executeMutation({
      variables: { input: { email } },
    });

    expect(data?.updateMe?.__typename).toBe("EmailAlreadyTakenError");
  });

  it("should update using input", async () => {
    const name = "foo";
    const email = "foo@foo.com";

    const { data } = await executeMutation({
      variables: { input: { name, email } },
    });

    expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: DBData.admin.id },
    });

    expect(user.name).toBe(name);
    expect(user.email).toBe(email);
  });

  it("should not update fields if the field is absent", async () => {
    const before = await prisma.user.findUniqueOrThrow({
      where: { id: DBData.admin.id },
    });

    const { data } = await executeMutation({
      variables: { input: {} },
    });

    expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: DBData.admin.id },
    });

    expect(before.name).toBe(after.name);
    expect(before.email).toBe(after.email);
    expect(before.password).toBe(after.password);
  });

  it("should update updatedAt", async () => {
    const before = await prisma.user.findUniqueOrThrow({
      where: { id: DBData.admin.id },
    });

    const { data } = await executeMutation({
      variables: { input: { name: "bar" } },
    });

    expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: DBData.admin.id },
    });

    const beforeUpdatedAt = before.updatedAt.getTime();
    const afterUpdatedAt = after.updatedAt.getTime();

    expect(afterUpdatedAt).toBeGreaterThan(beforeUpdatedAt);
  });

  it("should not update other attrs", async () => {
    const before = await prisma.user.findUniqueOrThrow({
      where: { id: DBData.admin.id },
    });

    const { data } = await executeMutation({
      variables: { input: { name: "baz" } },
    });

    expect(data?.updateMe?.__typename).toBe("UpdateMeSuccess");

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: DBData.admin.id },
    });

    // これらのフィールドは変化する想定
    const beforeToCompare = omit(before, ["name", "updatedAt"]);
    const afterToCompare = omit(after, ["name", "updatedAt"]);

    expect(afterToCompare).toStrictEqual(beforeToCompare);
  });
});
