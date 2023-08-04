import { DBData } from "it/data";
import { prisma } from "@/datasources";
import { logger } from "@/logger";
import type { Resolver } from "@/graphql/types";

/** user は admin */
export const defaultContext: Resolver.Context = {
  user: DBData.admin,
  logger,
  dataSources: {
    prisma,
  },
};
