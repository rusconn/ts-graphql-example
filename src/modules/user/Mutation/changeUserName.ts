import { NAME_MAX } from "./signup.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    changeUserName(input: ChangeUserNameInput!): ChangeUserNameResult
  }

  input ChangeUserNameInput {
    "${NAME_MAX}文字まで、既に存在する場合はエラー"
    name: NonEmptyString!
  }

  union ChangeUserNameResult = ChangeUserNameSuccess | UserNameAlreadyTakenError

  type ChangeUserNameSuccess {
    user: User!
  }
`;

export const resolver = () => null;
