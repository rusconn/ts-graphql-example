import * as cursorConnections from "./lib/graphql/cursor.ts";

import * as node from "./modules/node/mod.ts";
import * as post from "./modules/post/mod.ts";
import * as scalar from "./modules/scalar/mod.ts";
import * as user from "./modules/user/mod.ts";

const typeDef = /* GraphQL */ `
  type Query
  type Mutation

  ${cursorConnections.PageInfoTypeDefinition}

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
