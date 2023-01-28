import {
  NonEmptyStringTypeDefinition,
  DateTimeTypeDefinition,
  EmailAddressTypeDefinition,
} from "graphql-scalars";
import { gql } from "graphql-tag";

import * as nodes from "@/graphql/nodes";

const cursorConnectionsTypeDef = gql`
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`;

const errorTypeDef = gql`
  interface Error {
    message: String!
  }

  enum ErrorCode {
    BAD_USER_INPUT
    ALREADY_EXISTS
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

const scalarTypeDefs = [
  NonEmptyStringTypeDefinition,
  DateTimeTypeDefinition,
  EmailAddressTypeDefinition,
];

export const typeDefs = [
  cursorConnectionsTypeDef,
  errorTypeDef,
  orderDirectionTypeDef,
  ...scalarTypeDefs,
  ...nodes.typeDefs,
];
