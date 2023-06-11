import merge from "lodash/merge";

import * as node from "./node";
import * as todo from "./todo";
import * as user from "./user";

export const permissions = merge(node.permissions, todo.permissions, user.permissions);
