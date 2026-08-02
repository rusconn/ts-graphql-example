import type { Resolvers } from "./schema/_types.ts";
import * as Complexity from "./schema/complexity.ts";
import * as DateTimeISO from "./schema/DateTimeISO.ts";
import * as EmailAddress from "./schema/EmailAddress.ts";
import * as EmailAlreadyTakenError from "./schema/EmailAlreadyTakenError.ts";
import * as Error_ from "./schema/Error.ts";
import * as ErrorCode from "./schema/ErrorCode.ts";
import * as InvalidInputError from "./schema/InvalidInputError.ts";
import * as InvalidInputErrors from "./schema/InvalidInputErrors.ts";
import * as Mutation from "./schema/Mutation.ts";
import * as Node from "./schema/Node.ts";
import * as PageInfo from "./schema/PageInfo.ts";
import * as Query from "./schema/Query.ts";
import * as ResourceLimitExceededError from "./schema/ResourceLimitExceededError.ts";
import * as ResourceNotFoundError from "./schema/ResourceNotFoundError.ts";
import * as SemanticNonNull from "./schema/semanticNonNull.ts";
import * as Todo from "./schema/Todo.ts";
import * as User from "./schema/User.ts";
import * as Void from "./schema/Void.ts";

export const typeDefs = [
  DateTimeISO.typeDef,
  Complexity.typeDef,
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
  SemanticNonNull.typeDef,
  Todo.typeDefs,
  User.typeDefs,
  Void.typeDef,
];

export const resolvers: Resolvers = {
  DateTimeISO: DateTimeISO.resolver,
  EmailAddress: EmailAddress.resolver,
  Mutation: Mutation.resolvers,
  Node: Node.resolvers,
  Query: Query.resolvers,
  Todo: Todo.resolvers,
  User: User.resolvers,
  Void: Void.resolver,
};
