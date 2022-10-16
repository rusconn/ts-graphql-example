import { admin } from "it/data";
import { prisma } from "it/prisma";
import { makeLogger } from "@/utils";
import { TodoAPI, UserAPI } from "@/datasources";
import type { Context } from "@/types";

/** user は admin */
export const defaultContext: Context = {
  user: admin,
  logger: makeLogger("test"),
  dataSources: {
    todoAPI: new TodoAPI(prisma),
    userAPI: new UserAPI(prisma),
  },
};
