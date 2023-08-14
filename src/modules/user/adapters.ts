import type * as DataSource from "@/datasources";
import { toSpecifiedNodeId } from "../common/adapters";
import { nodeType } from "./typeDefs";

const toUserNodeId = toSpecifiedNodeId(nodeType);

export const adapters = {
  User: {
    id: (id: DataSource.User["id"]) => {
      return toUserNodeId(id);
    },
  },
};
