import type * as DataSource from "@/datasources";
import { toSpecifiedNodeId } from "../common/adapters";
import { dateTime, emailAddress, nonEmptyString } from "../scalar/adapters";
import { nodeType } from "./typeDefs";

const toUserNodeId = toSpecifiedNodeId(nodeType);

export const adapters = {
  User: {
    id: (id: DataSource.User["id"]) => {
      return toUserNodeId(id);
    },
    createdAt: (createdAt: DataSource.User["createdAt"]) => {
      return dateTime(createdAt.toISOString());
    },
    updatedAt: (updatedAt: DataSource.User["updatedAt"]) => {
      return dateTime(updatedAt.toISOString());
    },
    name: (name: DataSource.User["name"]) => {
      return nonEmptyString(name);
    },
    email: (email: DataSource.User["email"]) => {
      return emailAddress(email);
    },
    token: (token: DataSource.User["token"]) => {
      return token != null ? nonEmptyString(token) : token;
    },
  },
};
