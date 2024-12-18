import type { UserResolvers } from "../../../schema.ts";
import { cursorConnection } from "../../common/typeDefs.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type User {
    followings(
      """
      max: ${FIRST_MAX}
      """
      first: Int

      after: String

      """
      max: ${LAST_MAX}
      """
      last: Int

      before: String

      reverse: Boolean! = true

      sortKey: FollowingSortKeys! = FOLLOWED_AT
    ): FollowingConnection
  }

  enum FollowingSortKeys {
    FOLLOWED_AT
  }

  ${cursorConnection({
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

export const resolver: UserResolvers["followings"] = (parent, _args, context) => null;
