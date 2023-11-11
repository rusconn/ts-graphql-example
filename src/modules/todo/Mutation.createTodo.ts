import { ulid } from "ulid";

import { isAuthenticated } from "../common/authorizers";
import { ParseError } from "../common/parsers";
import { full } from "../common/resolvers";
import type { MutationResolvers, MutationCreateTodoArgs } from "../common/schema";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    createTodo(input: CreateTodoInput!): CreateTodoResult
  }

  input CreateTodoInput {
    "100文字まで"
    title: NonEmptyString!
    "5000文字まで"
    description: String!
  }

  union CreateTodoResult = CreateTodoSuccess

  type CreateTodoSuccess {
    todo: Todo!
  }
`;

export const resolver: MutationResolvers["createTodo"] = async (_parent, args, context) => {
  const authed = authorizer(context.user);

  const parsed = parser(args);

  const todo = await context.prisma.todo.create({
    data: { id: ulid(), userId: authed.id, ...parsed },
  });

  return {
    __typename: "CreateTodoSuccess",
    todo: full(todo),
  };
};

export const authorizer = isAuthenticated;

export const parser = (args: MutationCreateTodoArgs) => {
  const { title, description } = args.input;

  if ([...title].length > 100) {
    throw new ParseError("`title` must be up to 100 characters");
  }
  if ([...description].length > 5000) {
    throw new ParseError("`description` must be up to 5000 characters");
  }

  return { title, description };
};
