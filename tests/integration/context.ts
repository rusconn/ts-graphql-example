import { DBData } from "it/data";
import { prisma } from "it/prisma";
import { TodoAPI, UserAPI } from "@/datasources";
import { logger } from "@/logger";
import type { Context } from "@/types";

/** user は admin */
export const defaultContext: Context = {
  user: DBData.admin,
  logger,
  dataSources: {
    todoAPI: new TodoAPI(prisma),
    userAPI: new UserAPI(prisma),
  },
};
