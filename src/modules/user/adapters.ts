import type * as DataSource from "@/datasources";
import { nodeId } from "../common/adapters";
import { nodeType } from "./typeDefs";

const userNodeId = nodeId(nodeType);

export const adapters = {
  User: {
    id: (id: DataSource.User["id"]) => {
      return userNodeId(id);
    },
  },
};
