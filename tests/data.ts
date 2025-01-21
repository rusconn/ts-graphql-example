import * as post from "./data/post.ts";
import * as user from "./data/user.ts";

export const Data = {
  token: user.token,
  db: {
    ...post.db,
    ...user.db,
  },
  graph: {
    ...post.graph,
    ...user.graph,
  },
};

export const dummyId = {
  post: post.dummyId,
  user: user.dummyId,
};
