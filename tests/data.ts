import { context } from "../src/modules/common/testData/context.ts";

import * as post from "./data/post.ts";
import * as user from "./data/user.ts";

export const Data = {
  context,
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
