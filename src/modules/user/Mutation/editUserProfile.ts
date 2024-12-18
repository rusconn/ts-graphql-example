const AVATAR_MAX = 300;
const HANDLE_MAX = 50;
const BIO_MAX = 160;
const LOCATION_MAX = 30;
const WEBSITE_MAX = 100;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    "指定したフィールドのみ更新する"
    editUserProfile(input: EditUserProfileInput!): EditUserProfileResult
  }

  input EditUserProfileInput {
    "${AVATAR_MAX}文字まで"
    avatar: URL
    "${HANDLE_MAX}文字まで、null は入力エラー"
    handle: NonEmptyString
    "${BIO_MAX}文字まで、null は入力エラー"
    bio: String
    "${LOCATION_MAX}文字まで、null は入力エラー"
    location: String
    "${WEBSITE_MAX}文字まで、null は入力エラー"
    website: URL
  }

  union EditUserProfileResult = EditUserProfileSuccess

  type EditUserProfileSuccess {
    user: User!
  }
`;

export const resolver = () => null;
