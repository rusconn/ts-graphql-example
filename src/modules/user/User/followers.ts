import type { UserResolvers } from "../../../schema.ts";
import { cursorConnection } from "../../common/typeDefs.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type User {
    followers(
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

      sortKey: FollowerSortKeys! = FOLLOWED_AT
    ): FollowerConnection
  }

  enum FollowerSortKeys {
    FOLLOWED_AT
  }

  ${cursorConnection({
    nodeType: "User",
    edgeType: "Follower",
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

export const resolver: UserResolvers["followers"] = (parent, _args, context) => null;
