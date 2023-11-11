import type { Resolvers } from "../common/schema";
import * as Mutation from "./Mutation";
import * as Todo from "./Todo";
import * as User from "./User";

export const typeDefs = [Mutation.typeDefs, Todo.typeDefs, User.typeDefs];

export const resolvers: Resolvers = {
  Mutation: Mutation.resolvers,
  Todo: Todo.resolvers,
  User: User.resolvers,
};
