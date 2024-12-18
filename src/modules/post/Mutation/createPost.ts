export const CONTENT_MAX = 280;

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    createPost(input: CreatePostInput!): CreatePostResult
  }

  input CreatePostInput {
    "${CONTENT_MAX}文字まで"
    content: NonEmptyString!
  }

  union CreatePostResult = CreatePostSuccess

  type CreatePostSuccess {
    post: Post!
  }
`;
