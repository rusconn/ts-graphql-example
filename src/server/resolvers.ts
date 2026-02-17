import type { Resolvers } from "../graphql/_schema.ts";
import * as DateTime from "../graphql/DateTime.ts";
import * as EmailAddress from "../graphql/EmailAddress.ts";
import * as Mutation from "../graphql/Mutation.ts";
import * as Node from "../graphql/Node.ts";
import * as Query from "../graphql/Query.ts";
import * as Todo from "../graphql/Todo.ts";
import * as User from "../graphql/User.ts";
import * as Void from "../graphql/Void.ts";

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Node: Node.resolvers,
  Query: Query.resolvers,
  Todo: Todo.resolvers,
  User: User.resolvers,
  DateTime: DateTime.resolver,
  EmailAddress: EmailAddress.resolver,
  Void: Void.resolver,
};
