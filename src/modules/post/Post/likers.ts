import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    likers(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: LikerOrder! = { field: LIKED_AT, direction: DESC }
    ): LikerConnection
  }

  input LikerOrder {
    field: LikerOrderField!
    direction: OrderDirection!
  }

  enum LikerOrderField {
    LIKED_AT
  }

  ${cursorConnections({
    nodeType: "User",
    edgeType: "Liker",
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
