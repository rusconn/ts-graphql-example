import merge from "lodash/merge";

import * as node from "./node";
import * as scalar from "./scalar";
import * as todo from "./todo";
import * as user from "./user";

export const resolvers = merge(node.resolvers, scalar.resolvers, todo.resolvers, user.resolvers);
