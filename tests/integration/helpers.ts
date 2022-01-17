import type { DocumentNode } from "graphql";
import type { ExpressContext } from "apollo-server-express";

import { prisma } from "it/prisma";

type MakeContextParams = {
  query: string | DocumentNode;
  token?: string;
};

export const makeContext = ({ query, token }: MakeContextParams) =>
  ({
    req: {
      headers: { authorization: token },
      body: { query },
    },
  } as ExpressContext);

export const clearTables = () => Promise.all([prisma.todo.deleteMany(), prisma.user.deleteMany()]);
