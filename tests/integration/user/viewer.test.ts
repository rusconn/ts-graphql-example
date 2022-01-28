import type { GraphQLFormattedError } from "graphql";
import { gql } from "apollo-server";

import type { ViewerQuery } from "it/types";
import { admin, alice, bob, guest } from "it/data";
import { makeContext, clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { getEnvsWithValidation, makeServer } from "@/utils";
import { ErrorCode, User } from "@/types";

const envs = getEnvsWithValidation();
const server = makeServer({ ...envs, prisma });

const users = [admin, alice, bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = gql`
  query Viewer {
    viewer {
      id
    }
  }
`;

type ResponseType = {
  data?: ViewerQuery | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
};

type ExecuteQueryParams = {
  token?: User["token"];
};

/**
 * token のデフォルトは admin.token
 * @param params token の上書きや variables の指定に使う
 */
const executeQuery = (params: ExecuteQueryParams) => {
  const token = "token" in params ? params.token : admin.token;

  return server.executeOperation(
    { query, variables: {} },
    makeContext({ query, token })
  ) as Promise<ResponseType>;
};

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  const alloweds = [admin, alice, bob];
  const notAlloweds = [guest];

  test.each(alloweds)("allowed %o", async ({ token }) => {
    const { data, errors } = await executeQuery({ token });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.viewer).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async ({ token }) => {
    const { data, errors } = await executeQuery({ token });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.viewer).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});
