import * as node from "./modules/node/mod.ts";
import * as scalar from "./modules/scalar/mod.ts";
import * as todo from "./modules/todo/mod.ts";
import * as user from "./modules/user/mod.ts";

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

  type ResourceLimitExceededError implements Error {
    message: String!
  }
  type ResourceNotFoundError implements Error {
    message: String!
  }

  enum ErrorCode {
    BAD_USER_INPUT
    AUTHENTICATION_ERROR
    FORBIDDEN
    NOT_FOUND
  }
`;

export const typeDefs = [typeDef, node.typeDefs, scalar.typeDefs, todo.typeDefs, user.typeDefs];
