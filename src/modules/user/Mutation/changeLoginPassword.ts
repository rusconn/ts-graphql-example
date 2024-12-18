import { PASS_MAX, PASS_MIN } from "./signup.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeLoginPassword(input: ChangeLoginPasswordInput!): ChangeLoginPasswordResult
  }

  input ChangeLoginPasswordInput {
    "${PASS_MIN}文字以上、${PASS_MAX}文字まで"
    password: NonEmptyString!
  }

  union ChangeLoginPasswordResult = ChangeLoginPasswordSuccess

  type ChangeLoginPasswordSuccess {
    password: NonEmptyString!
  }
`;

export const resolver = () => null;
