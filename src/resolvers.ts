import * as node from "./modules/node";
import * as scalar from "./modules/scalar";
import * as todo from "./modules/todo";
import * as user from "./modules/user";

export const resolvers = [node.resolvers, scalar.resolvers, todo.resolvers, user.resolvers];
