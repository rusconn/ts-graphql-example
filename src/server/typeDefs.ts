import * as DateTime from "../graphql/DateTime.ts";
import * as EmailAddress from "../graphql/EmailAddress.ts";
import * as EmailAlreadyTakenError from "../graphql/EmailAlreadyTakenError.ts";
import * as Error_ from "../graphql/Error.ts";
import * as ErrorCode from "../graphql/ErrorCode.ts";
import * as InvalidInputError from "../graphql/InvalidInputError.ts";
import * as InvalidInputErrors from "../graphql/InvalidInputErrors.ts";
import * as Mutation from "../graphql/Mutation/_mod.ts";
import * as Node from "../graphql/Node/_mod.ts";
import * as PageInfo from "../graphql/PageInfo.ts";
import * as Query from "../graphql/Query/_mod.ts";
import * as ResourceLimitExceededError from "../graphql/ResourceLimitExceededError.ts";
import * as ResourceNotFoundError from "../graphql/ResourceNotFoundError.ts";
import * as Todo from "../graphql/Todo/_mod.ts";
import * as User from "../graphql/User/_mod.ts";
import * as Directives from "./directives.ts";

export const typeDefs = [
  Directives.typeDefs,
  Mutation.typeDefs,
  Node.typeDefs,
  Query.typeDefs,
  Todo.typeDefs,
  User.typeDefs,
  DateTime.typeDef,
  EmailAddress.typeDef,
  EmailAlreadyTakenError.typeDef,
  Error_.typeDef,
  ErrorCode.typeDef,
  InvalidInputError.typeDef,
  InvalidInputErrors.typeDef,
  PageInfo.typeDef,
  ResourceLimitExceededError.typeDef,
  ResourceNotFoundError.typeDef,
];
