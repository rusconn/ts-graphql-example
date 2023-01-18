import { DBData } from "it/data";
import { prisma } from "it/prisma";
import { TodoAPI, UserAPI } from "@/datasources";
import { logger } from "@/server/logger";
import type { Context } from "@/server/types";

/** user は admin */
export const defaultContext: Context = {
  user: DBData.admin,
  logger,
  dataSources: {
    todoAPI: new TodoAPI(prisma),
    userAPI: new UserAPI(prisma),
  },
};
