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

// Promise.all() だとたまにデッドロックが発生するので直列実行
export const clearTables = async () => {
  await prisma.todo.deleteMany();
  await prisma.user.deleteMany();
};
