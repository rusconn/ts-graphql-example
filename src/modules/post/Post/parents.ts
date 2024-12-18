import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type Post {
    parents(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: ParentPostOrder! = { field: CREATED_AT, direction: ASC }
    ): ParentPostConnection
  }

  input ParentPostOrder {
    field: ParentPostOrderField!
    direction: OrderDirection!
  }

  enum ParentPostOrderField {
    CREATED_AT
  }

  ${cursorConnections({
    nodeType: "Post",
    edgeType: "ParentPost",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;
