import * as Directives from "./directives.ts";
import * as DateTime from "./graphql/DateTime.ts";
import * as EmailAddress from "./graphql/EmailAddress.ts";
import * as Error_ from "./graphql/Error.ts";
import * as ErrorCode from "./graphql/ErrorCode.ts";
import * as InvalidInputError from "./graphql/InvalidInputError.ts";
import * as InvalidInputErrors from "./graphql/InvalidInputErrors.ts";
import * as Mutation from "./graphql/Mutation/_mod.ts";
import * as Node from "./graphql/Node/_mod.ts";
import * as PageInfo from "./graphql/PageInfo.ts";
import * as Post from "./graphql/Post/_mod.ts";
import * as Query from "./graphql/Query/_mod.ts";
import * as ResourceNotFoundError from "./graphql/ResourceNotFoundError.ts";
import * as URL_ from "./graphql/URL.ts";
import * as User from "./graphql/User/_mod.ts";
import * as UserEmailAlreadyTakenError from "./graphql/UserEmailAlreadyTakenError.ts";
import * as UserNameAlreadyTakenError from "./graphql/UserNameAlreadyTakenError.ts";

export const typeDefs = [
  Directives.typeDefs,
  Mutation.typeDefs,
  Node.typeDefs,
  Post.typeDefs,
  Query.typeDefs,
  User.typeDefs,
  DateTime.typeDef,
  EmailAddress.typeDef,
  Error_.typeDef,
  ErrorCode.typeDef,
  InvalidInputError.typeDef,
  InvalidInputErrors.typeDef,
  PageInfo.typeDef,
  ResourceNotFoundError.typeDef,
  URL_.typeDef,
  UserEmailAlreadyTakenError.typeDef,
  UserNameAlreadyTakenError.typeDef,
];
