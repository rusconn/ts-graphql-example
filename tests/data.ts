import * as todo from "@/modules/todo/common/test.ts";
import * as user from "@/modules/user/common/test.ts";

export const ContextData = user.context;

export const DBData = {
  ...todo.db,
  ...user.db,
};

export const GraphData = {
  ...todo.graph,
  ...user.graph,
};

export { validNodeIds, invalidNodeIds } from "@/modules/node/common/test.ts";
