import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    replies(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: ReplyOrder! = { field: REPLIED_AT, direction: ASC }
    ): ReplyConnection
  }

  input ReplyOrder {
    field: ReplyOrderField!
    direction: OrderDirection!
  }

  enum ReplyOrderField {
    REPLIED_AT
  }

  ${cursorConnections({
    nodeType: "Post",
    edgeType: "Reply",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;
