import * as node from "./modules/node/mod.ts";
import * as post from "./modules/post/mod.ts";
import * as scalar from "./modules/scalar/mod.ts";
import * as user from "./modules/user/mod.ts";

export const resolvers = [node.resolvers, post.resolvers, scalar.resolvers, user.resolvers];
