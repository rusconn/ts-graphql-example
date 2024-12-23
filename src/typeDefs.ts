import { PageInfoTypeDefinition } from "./lib/graphql/cursorConnections/sdl.ts";
import * as node from "./modules/node/_mod.ts";
import * as scalar from "./modules/scalar/_mod.ts";
import * as todo from "./modules/todo/_mod.ts";
import * as user from "./modules/user/_mod.ts";

const typeDef = /* GraphQL */ `
  type Query
  type Mutation

  ${PageInfoTypeDefinition}

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

export const typeDefs = [typeDef, node.typeDefs, scalar.typeDefs, todo.typeDefs, user.typeDefs];
