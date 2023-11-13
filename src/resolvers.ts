import * as node from "./modules/node/mod.js";
import * as scalar from "./modules/scalar/mod.js";
import * as todo from "./modules/todo/mod.js";
import * as user from "./modules/user/mod.js";

export const resolvers = [node.resolvers, scalar.resolvers, todo.resolvers, user.resolvers];
