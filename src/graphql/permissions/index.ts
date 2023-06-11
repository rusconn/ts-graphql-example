import merge from "lodash/merge";

import node from "./node";
import todo from "./todo";
import user from "./user";

export const permissions = merge(node, todo, user);
