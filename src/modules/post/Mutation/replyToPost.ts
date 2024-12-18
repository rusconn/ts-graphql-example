import { CONTENT_MAX } from "./createPost.ts";

export const typeDef = /* GraphQL */ `
  extend type Mutation {
    replyToPost(id: ID!, input: ReplyToPostInput!): ReplyToPostResult
  }

  input ReplyToPostInput {
    "${CONTENT_MAX}文字まで"
    content: NonEmptyString!
  }

  union ReplyToPostResult = ReplyToPostSuccess

  type ReplyToPostSuccess {
    post: Post!
  }
`;

export const resolver = () => null;
