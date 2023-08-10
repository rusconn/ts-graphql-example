import merge from "lodash/merge";

import node from "./modules/node/permissions";
import todo from "./modules/todo/permissions";
import user from "./modules/user/permissions";

export const permissions = merge(node, todo, user);
