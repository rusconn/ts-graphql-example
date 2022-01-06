import * as scalars from "graphql-scalars";
import { gql } from "apollo-server";

import * as nodes from "@/nodes";

const errorTypeDef = gql`
  enum ErrorCode {
    BAD_USER_INPUT
    AUTHENTICATION_ERROR
    FORBIDDEN
    INTERNAL_SERVER_ERROR
  }
`;

export const typeDefs = [errorTypeDef, ...scalars.typeDefs, ...nodes.typeDefs];
