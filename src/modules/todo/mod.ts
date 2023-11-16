import type { Resolvers } from "../common/schema.ts";
import * as Mutation from "./Mutation.ts";
import * as Todo from "./Todo.ts";
import * as User from "./User.ts";

export const typeDefs = [Mutation.typeDefs, Todo.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Todo: Todo.resolvers,
  User: User.resolvers,
};
