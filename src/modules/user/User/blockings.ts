import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 50;
const LAST_MAX = 50;

export const typeDef = /* GraphQL */ `
  extend type User {
    blockings(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: BlockingOrder! = { field: BLOCKED_AT, direction: DESC }
    ): BlockingConnection
  }

  input BlockingOrder {
    field: BlockingOrderField!
    direction: OrderDirection!
  }

  enum BlockingOrderField {
    BLOCKED_AT
  }

  ${cursorConnections({
    nodeType: "User",
    edgeType: "Blocking",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
      edgeFields: {
        blockedAt: "DateTime",
      },
    },
  })}
`;

export const resolver = () => null;
