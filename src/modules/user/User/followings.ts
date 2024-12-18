import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type User {
    followings(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: FollowingOrder! = { field: FOLLOWED_AT, direction: DESC }
    ): FollowingConnection
  }

  input FollowingOrder {
    field: FollowingOrderField!
    direction: OrderDirection!
  }

  enum FollowingOrderField {
    FOLLOWED_AT
  }

  ${cursorConnections({
    nodeType: "User",
    edgeType: "Following",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
      edgeFields: {
        followedAt: "DateTime",
      },
    },
  })}
`;
