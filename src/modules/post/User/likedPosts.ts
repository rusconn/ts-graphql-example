import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    likedPosts(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: LikedPostPostOrder! = { field: LIKED_AT, direction: DESC }
    ): LikedPostConnection
  }

  input LikedPostPostOrder {
    field: LikedPostOrderField!
    direction: OrderDirection!
  }

  enum LikedPostOrderField {
    LIKED_AT
  }

  ${cursorConnections({
    nodeType: "Post",
    edgeType: "LikedPost",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
      edgeFields: {
        likedAt: "DateTime",
      },
    },
  })}
`;

export const resolver = () => null;
