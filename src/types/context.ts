import type { Logger } from "pino";
import type { User } from "@prisma/client";

import type { TodoAPI, UserAPI } from "@/datasources";

export type Context = {
  logger: Logger;
  user: Pick<User, "id" | "role">;
  dataSources: {
    todoAPI: TodoAPI;
    userAPI: UserAPI;
  };
};
