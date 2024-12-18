import { EMAIL_MAX } from "./signup.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeUserEmail(input: ChangeUserEmailInput!): ChangeUserEmailResult
  }

  input ChangeUserEmailInput {
    "${EMAIL_MAX}文字まで、既に存在する場合はエラー"
    email: NonEmptyString!
  }

  union ChangeUserEmailResult = ChangeUserEmailSuccess | UserEmailAlreadyTakenError

  type ChangeUserEmailSuccess {
    user: User!
  }
`;
