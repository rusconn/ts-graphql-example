import { NonEmptyStringTypeDefinition, DateTimeTypeDefinition } from "graphql-scalars";
import { gql } from "graphql-tag";

import * as nodes from "@/nodes";

const cursorConnectionsTypeDef = gql`
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

const errorTypeDef = gql`
  enum ErrorCode {
    BAD_USER_INPUT
    AUTHENTICATION_ERROR
    FORBIDDEN
    NOT_FOUND
    INTERNAL_SERVER_ERROR
  }
`;

const orderDirectionTypeDef = gql`
  enum OrderDirection {
    ASC
    DESC
  }
`;

const scalarTypeDefs = [NonEmptyStringTypeDefinition, DateTimeTypeDefinition];

export const typeDefs = [
  cursorConnectionsTypeDef,
  errorTypeDef,
  orderDirectionTypeDef,
  ...scalarTypeDefs,
  ...nodes.typeDefs,
];
