import * as DateTime from "./graphql/DateTime.ts";
import * as EmailAddress from "./graphql/EmailAddress.ts";
import * as Mutation from "./graphql/Mutation/_mod.ts";
import * as Node from "./graphql/Node/_mod.ts";
import * as NonEmptyString from "./graphql/NonEmptyString.ts";
import * as Query from "./graphql/Query/_mod.ts";
import * as Todo from "./graphql/Todo/_mod.ts";
import * as User from "./graphql/User/_mod.ts";
import { PageInfoTypeDefinition } from "./lib/graphql/cursorConnections/sdl.ts";

const typeDef = /* GraphQL */ `
  type Query
  type Mutation

  ${PageInfoTypeDefinition}

  interface Error {
    message: String!
  }

  type EmailAlreadyTakenError implements Error {
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
    INTERNAL_SERVER_ERROR
  }
`;

export const typeDefs = [
  typeDef,
  Mutation.typeDefs,
  Node.typeDefs,
  Query.typeDefs,
  Todo.typeDefs,
  User.typeDefs,
  DateTime.typeDef,
  EmailAddress.typeDef,
  NonEmptyString.typeDef,
];
