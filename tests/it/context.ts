import { DBData } from "it/data";
import { prisma } from "@/datasources";
import { logger } from "@/logger";
import type { Context } from "@/types";

/** user は admin */
export const defaultContext: Context = {
  user: DBData.admin,
  logger,
  dataSources: {
    prisma,
  },
};
