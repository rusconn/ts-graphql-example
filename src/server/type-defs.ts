import * as Directives from "../graphql/_directives.ts";
import * as DateTime from "../graphql/DateTime.ts";
import * as EmailAddress from "../graphql/EmailAddress.ts";
import * as EmailAlreadyTakenError from "../graphql/EmailAlreadyTakenError.ts";
import * as Error_ from "../graphql/Error.ts";
import * as ErrorCode from "../graphql/ErrorCode.ts";
import * as InvalidInputError from "../graphql/InvalidInputError.ts";
import * as InvalidInputErrors from "../graphql/InvalidInputErrors.ts";
import * as Mutation from "../graphql/Mutation.ts";
import * as Node from "../graphql/Node.ts";
import * as PageInfo from "../graphql/PageInfo.ts";
import * as Query from "../graphql/Query.ts";
import * as ResourceLimitExceededError from "../graphql/ResourceLimitExceededError.ts";
import * as ResourceNotFoundError from "../graphql/ResourceNotFoundError.ts";
import * as Todo from "../graphql/Todo.ts";
import * as User from "../graphql/User.ts";
import * as Void from "../graphql/Void.ts";

export const typeDefs = [
  Directives.typeDefs,
  DateTime.typeDef,
  EmailAddress.typeDef,
  EmailAlreadyTakenError.typeDef,
  Error_.typeDef,
  ErrorCode.typeDef,
  InvalidInputError.typeDef,
  InvalidInputErrors.typeDef,
  Mutation.typeDefs,
  Node.typeDefs,
  PageInfo.typeDef,
  Query.typeDefs,
  ResourceLimitExceededError.typeDef,
  ResourceNotFoundError.typeDef,
  Todo.typeDefs,
  User.typeDefs,
  Void.typeDef,
];
