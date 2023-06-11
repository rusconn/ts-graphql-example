import { gql } from "graphql-tag";

export default gql`
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
