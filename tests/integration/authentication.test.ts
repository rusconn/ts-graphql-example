import { ApolloError } from "apollo-server";

import { prisma } from "it/prisma";
import { admin, alice, bob } from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { getEnvsWithValidation, makeServer } from "@/utils";
import { ErrorCode } from "@/types";

const envs = getEnvsWithValidation();
const server = makeServer({ ...envs, prisma });

const seedUsers = () => prisma.user.createMany({ data: [admin, alice, bob] });

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

test("api should reject invalid token", async () => {
  const query = `{ users { totalCount } }`;

  // context building で例外が発生すると、レスポンスに errors が含まれるのではなく
  // executeOperation が例外を投げるよう？
  try {
    await server.executeOperation(
      { query },
      makeContext({ query, token: `${admin.token.slice(0, -1)}A` })
    );
    throw new Error("no errors occurred");
  } catch (e) {
    if (e instanceof ApolloError) {
      expect(e.extensions.code).toBe(ErrorCode.AuthenticationError);
    } else {
      throw new Error("no graphql errors thrown");
    }
  }
});

test("api should accept valid token", async () => {
  const query = `query($id: ID!) { user(id: $id) { id } }`;

  const executions = [admin, alice].map(({ id, token }) =>
    server.executeOperation({ query, variables: { id } }, makeContext({ query, token }))
  );

  const [res1, res2] = await Promise.all(executions);

  expect(res1.errors).toBeUndefined();
  expect(res2.errors).toBeUndefined();
});

test("api should accept token-less request as guest", async () => {
  const query = `{ users { totalCount } }`;

  const { errors } = await server.executeOperation({ query }, makeContext({ query }));
  const errorCodes = errors?.map(({ extensions }) => extensions?.code);

  expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.AuthenticationError]));
});
