import { context } from "@/modules/common/testData/context.ts";

import * as todo from "./data/todo.ts";
import * as user from "./data/user.ts";

export const Data = {
  context,
  db: {
    ...todo.db,
    ...user.db,
  },
  graph: {
    ...todo.graph,
    ...user.graph,
  },
};
