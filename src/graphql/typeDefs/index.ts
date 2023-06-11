import * as error from "./error";
import * as node from "./node";
import * as orderDirection from "./orderDirection";
import * as pageInfo from "./pageInfo";
import * as scalar from "./scalar";
import * as todo from "./todo";
import * as user from "./user";

export const typeDefs = [
  error.typeDefs,
  node.typeDefs,
  orderDirection.typeDefs,
  pageInfo.typeDefs,
  ...scalar.typeDefs,
  todo.typeDefs,
  user.typeDefs,
];
