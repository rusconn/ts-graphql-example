import { gql } from "graphql-tag";

import type { ViewerQuery } from "it/types";
import { defaultContext } from "it/context";
import { admin, alice, bob, guest } from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { server } from "it/server";
import { Context, ErrorCode } from "@/types";

const users = [admin, alice, bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = gql`
  query Viewer {
    viewer {
      id
    }
  }
`;

type ExecuteQueryParams = {
  user?: Context["user"];
};

/**
 * user のデフォルトは admin
 * @param params user の上書きや variables の指定に使う
 */
const executeQuery = async (params: ExecuteQueryParams) => {
  const user = params.user ?? admin;

  const res = await server.executeOperation<ViewerQuery>(
    { query },
    { contextValue: { ...defaultContext, user } }
  );

  if (res.body.kind !== "single") {
    throw new Error("not single");
  }

  return res.body.singleResult;
};

beforeAll(async () => {
  await clearTables();
  await seedUsers();
});

describe("authorization", () => {
  const alloweds = [admin, alice, bob];
  const notAlloweds = [guest];

  test.each(alloweds)("allowed %o", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.viewer).not.toBeFalsy();
    expect(errorCodes).not.toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.viewer).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([ErrorCode.Forbidden]));
  });
});
