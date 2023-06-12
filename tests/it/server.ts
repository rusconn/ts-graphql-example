import type { DocumentNode } from "graphql";

import { defaultContext } from "it/context";
import { DBData } from "it/data";
import type { Context } from "@/types";
import { server } from "@/server";

type ExecuteOperationParams<TVariables> = {
  variables?: TVariables;
  user?: Context["user"];
};

export const executeSingleResultOperation =
  (query: DocumentNode) =>
  async <TData, TVariables>({
    variables,
    user = DBData.admin,
  }: ExecuteOperationParams<TVariables>) => {
    const res = await server.executeOperation<TData, TVariables>(
      { query, variables },
      { contextValue: { ...defaultContext, user } }
    );

    if (res.body.kind !== "single") {
      throw new Error("not single");
    }

    return res.body.singleResult;
  };
