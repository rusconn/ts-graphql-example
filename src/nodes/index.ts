import merge from "lodash/merge";

import * as node from "./node";
import * as todo from "./todo";
import * as user from "./user";

export const permissions = merge(node.permissions, todo.permissions, user.permissions);
export const resolvers = merge(node.resolvers, todo.resolvers, user.resolvers);
export const typeDefs = [node.typeDefs, todo.typeDefs, user.typeDefs];
