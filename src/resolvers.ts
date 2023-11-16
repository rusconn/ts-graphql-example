import * as node from "./modules/node/mod.ts";
import * as scalar from "./modules/scalar/mod.ts";
import * as todo from "./modules/todo/mod.ts";
import * as user from "./modules/user/mod.ts";

export const resolvers = [node.resolvers, scalar.resolvers, todo.resolvers, user.resolvers];
