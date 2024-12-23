import type { Kysely } from "kysely";

import type { DB } from "../db/types.ts";
import { TodoAPI } from "./todo.ts";
import { UserAPI } from "./user.ts";

export const createAPIs = (db: Kysely<DB>) => ({
  todo: new TodoAPI(db),
  user: new UserAPI(db),
});
