import type { Resolvers } from "../common/schema.js";
import * as Mutation from "./Mutation.js";
import * as Todo from "./Todo.js";
import * as User from "./User.js";

export const typeDefs = [Mutation.typeDefs, Todo.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Todo: Todo.resolvers,
  User: User.resolvers,
};
