import * as DateTime from "./graphql/DateTime.ts";
import * as EmailAddress from "./graphql/EmailAddress.ts";
import * as Mutation from "./graphql/Mutation/_mod.ts";
import * as Node from "./graphql/Node/_mod.ts";
import * as NonEmptyString from "./graphql/NonEmptyString.ts";
import * as Post from "./graphql/Post/_mod.ts";
import * as Query from "./graphql/Query/_mod.ts";
import * as URL_ from "./graphql/URL.ts";
import * as User from "./graphql/User/_mod.ts";
import type { Resolvers } from "./schema.ts";

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Node: Node.resolvers,
  Post: Post.resolvers,
  Query: Query.resolvers,
  User: User.resolvers,
  DateTime: DateTime.resolver,
  EmailAddress: EmailAddress.resolver,
  NonEmptyString: NonEmptyString.resolver,
  URL: URL_.resolver,
};
