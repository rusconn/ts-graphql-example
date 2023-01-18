import { DBData } from "it/data";
import { prisma } from "it/prisma";
import { TodoAPI, UserAPI } from "@/datasources";
import type { Context } from "@/server/types";
import { makeLogger } from "@/server/utils";

/** user は admin */
export const defaultContext: Context = {
  user: DBData.admin,
  logger: makeLogger(),
  dataSources: {
    todoAPI: new TodoAPI(prisma),
    userAPI: new UserAPI(prisma),
  },
};
