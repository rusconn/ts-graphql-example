import * as node from "./modules/node/mod.js";
import * as scalar from "./modules/scalar/mod.js";
import * as todo from "./modules/todo/mod.js";
import * as user from "./modules/user/mod.js";

const typeDef = /* GraphQL */ `
  type Query
  type Mutation

  enum OrderDirection {
    ASC
    DESC
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  interface Error {
    message: String!
  }

  enum ErrorCode {
    BAD_USER_INPUT
    AUTHENTICATION_ERROR
    FORBIDDEN
    NOT_FOUND
    INTERNAL_SERVER_ERROR
  }
`;

export const typeDefs = [typeDef, node.typeDefs, scalar.typeDefs, todo.typeDefs, user.typeDefs];
