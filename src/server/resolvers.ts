import * as DateTime from "../graphql/DateTime.ts";
import * as EmailAddress from "../graphql/EmailAddress.ts";
import * as Mutation from "../graphql/Mutation/_mod.ts";
import * as Node from "../graphql/Node/_mod.ts";
import * as Query from "../graphql/Query/_mod.ts";
import * as Todo from "../graphql/Todo/_mod.ts";
import * as User from "../graphql/User/_mod.ts";
import type { Resolvers } from "../graphql/_schema.ts";

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Node: Node.resolvers,
  Query: Query.resolvers,
  Todo: Todo.resolvers,
  User: User.resolvers,
  DateTime: DateTime.resolver,
  EmailAddress: EmailAddress.resolver,
};
