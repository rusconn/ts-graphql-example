import type { Logger } from "pino";

import type { TodoAPI, User, UserAPI } from "@/datasources";

export type Context = {
  logger: Logger;
  user: Pick<User, "id" | "role"> | { id: "GUEST"; role: "GUEST" };
  dataSources: {
    todoAPI: TodoAPI;
    userAPI: UserAPI;
  };
};
