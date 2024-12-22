import { context } from "../src/modules/common/testData/context.ts";

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

export const dummyId = {
  todo: todo.dummyId,
  user: user.dummyId,
};
