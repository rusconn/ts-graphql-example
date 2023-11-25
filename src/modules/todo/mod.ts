import type { Resolvers } from "../common/schema.ts";
import * as Mutation from "./Mutation/_mod.ts";
import * as Todo from "./Todo/_mod.ts";
import * as User from "./User/_mod.ts";

export const typeDefs = [Mutation.typeDefs, Todo.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Todo: Todo.resolvers,
  User: User.resolvers,
};
