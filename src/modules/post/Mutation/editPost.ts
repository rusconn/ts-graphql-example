import { CONTENT_MAX } from "./createPost.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    editPost(id: ID!, input: EditPostInput!): EditPostResult
  }

  input EditPostInput {
    "${CONTENT_MAX}文字まで"
    content: NonEmptyString!
  }

  union EditPostResult = EditPostSuccess | ResourceNotFoundError

  type EditPostSuccess {
    post: Post!
  }
`;
