import node from "./modules/node/typeDefs";
import scalar from "./modules/scalar/typeDefs";
import todo from "./modules/todo/typeDefs";
import user from "./modules/user/typeDefs";

const misc = /* GraphQL */ `
  type Query
  type Mutation

  enum OrderDirection {
    ASC
    DESC
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  interface Error {
    message: String!
  }

  enum ErrorCode {
    BAD_USER_INPUT
    AUTHENTICATION_ERROR
    FORBIDDEN
    NOT_FOUND
    INTERNAL_SERVER_ERROR
  }
`;

export const typeDefs = [node, scalar, todo, user, misc];
