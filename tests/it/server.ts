import type { DocumentNode } from "graphql";

import { DBData } from "it/data";
import type { Context } from "@/modules/common/resolvers";
import { logger } from "@/logger";
import { prisma } from "@/prisma";
import { server } from "@/server";

type ExecuteOperationParams<TVariables> = {
  variables?: TVariables;
  user?: Context["user"];
};

/** デフォルトユーザーは admin */
export const executeSingleResultOperation =
  (query: DocumentNode | string) =>
  async <TData, TVariables>({
    variables,
    user = DBData.admin,
  }: ExecuteOperationParams<TVariables>) => {
    const res = await server.executeOperation<TData, TVariables>(
      { query, variables },
      { contextValue: { prisma, user, logger: logger() } }
    );

    if (res.body.kind !== "single") {
      throw new Error("not single");
    }

    return res.body.singleResult;
  };
