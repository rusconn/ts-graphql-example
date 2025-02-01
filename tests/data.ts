import * as todo from "./data/todo.ts";
import * as user from "./data/user.ts";

export const Data = {
  token: user.token,
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
