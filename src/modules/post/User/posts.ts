import { cursorConnections } from "../../common/typeDefs.ts";

const FIRST_MAX = 30;
const LAST_MAX = 30;

export const typeDef = /* GraphQL */ `
  extend type User {
    posts(
      "max: ${FIRST_MAX}"
      first: Int
      after: String
      "max: ${LAST_MAX}"
      last: Int
      before: String
      orderBy: PostOrder! = { field: CREATED_AT, direction: DESC }
    ): PostConnection
  }

  input PostOrder {
    field: PostOrderField!
    direction: OrderDirection!
  }

  enum PostOrderField {
    CREATED_AT
    UPDATED_AT
  }

  ${cursorConnections({
    nodeType: "Post",
    additionals: {
      connectionFields: {
        totalCount: "Int",
      },
    },
  })}
`;

export const resolver = () => null;
