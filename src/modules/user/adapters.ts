import type * as DataSource from "@/datasources";
import { toSpecifiedNodeId } from "../common/adapters";
import { nodeType } from "./typeDefs";

const toUserNodeId = toSpecifiedNodeId(nodeType);

export const adapters = {
  User: {
    id: (id: DataSource.User["id"]) => {
      return toUserNodeId(id);
    },
    createdAt: (createdAt: DataSource.User["createdAt"]) => {
      return createdAt;
    },
    updatedAt: (updatedAt: DataSource.User["updatedAt"]) => {
      return updatedAt;
    },
    name: (name: DataSource.User["name"]) => {
      return name;
    },
    email: (email: DataSource.User["email"]) => {
      return email;
    },
    token: (token: DataSource.User["token"]) => {
      return token;
    },
  },
};
