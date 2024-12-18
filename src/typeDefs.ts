import { PageInfoTypeDefinition } from "./lib/graphql/cursorConnections/sdl.ts";
import * as node from "./modules/node/_mod.ts";
import * as post from "./modules/post/_mod.ts";
import * as scalar from "./modules/scalar/_mod.ts";
import * as user from "./modules/user/_mod.ts";

const typeDef = /* GraphQL */ `
  type Query
  type Mutation

  ${PageInfoTypeDefinition}

  interface Error {
    message: String!
  }

  type ResourceNotFoundError implements Error {
    message: String!
  }
  type InvalidInputError implements Error {
    message: String!
  }

  enum ErrorCode {
    AUTHENTICATION_ERROR
    FORBIDDEN
    BAD_USER_INPUT
  }
`;

export const typeDefs = [typeDef, node.typeDefs, post.typeDefs, scalar.typeDefs, user.typeDefs];
