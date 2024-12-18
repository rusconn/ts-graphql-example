import * as node from "./modules/node/mod.ts";
import * as post from "./modules/post/mod.ts";
import * as scalar from "./modules/scalar/mod.ts";
import * as user from "./modules/user/mod.ts";

const typeDef = /* GraphQL */ `
  directive @oneOf on INPUT_OBJECT | FIELD_DEFINITION

  type Query
  type Mutation

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
  type InvalidInputError implements Error {
    message: String!
  }

  enum ErrorCode {
    BAD_USER_INPUT
    AUTHENTICATION_ERROR
    FORBIDDEN
  }
`;

export const typeDefs = [typeDef, node.typeDefs, post.typeDefs, scalar.typeDefs, user.typeDefs];
