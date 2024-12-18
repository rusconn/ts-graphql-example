export const typeDef = /* GraphQL */ `
  extend type Post {
    counts: PostCounts
  }

  type PostCounts {
    replies: Int
    likes: Int
  }
`;
