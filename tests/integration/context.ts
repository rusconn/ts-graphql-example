import { DBData } from "it/data";
import { logger } from "@/logger";
import type { Context } from "@/types";
import { todoAPI, userAPI } from "./datasources";

/** user は admin */
export const defaultContext: Context = {
  user: DBData.admin,
  logger,
  dataSources: {
    todoAPI,
    userAPI,
  },
};
