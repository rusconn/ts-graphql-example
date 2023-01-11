import { gql } from "graphql-tag";

import type { ViewerQuery, ViewerQueryVariables } from "it/graphql/types";
import { admin, alice, bob, guest } from "it/data";
import { clearTables } from "it/helpers";
import { prisma } from "it/prisma";
import { executeSingleResultOperation } from "it/server";
import { Graph } from "@/graphql/types";

const users = [admin, alice, bob];

const seedUsers = () => prisma.user.createMany({ data: users });

const query = gql`
  query Viewer {
    viewer {
      id
    }
  }
`;

const executeQuery = executeSingleResultOperation(query)<ViewerQuery, ViewerQueryVariables>;

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
    expect(errorCodes).not.toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });

  test.each(notAlloweds)("not allowed %o", async user => {
    const { data, errors } = await executeQuery({ user });
    const errorCodes = errors?.map(({ extensions }) => extensions?.code);

    expect(data?.viewer).toBeFalsy();
    expect(errorCodes).toEqual(expect.arrayContaining([Graph.ErrorCode.Forbidden]));
  });
});