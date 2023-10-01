import type * as Prisma from "@/prisma";
import { nodeId } from "../common/adapters";
import { nodeType } from "./typeDefs";

const userNodeId = nodeId(nodeType);

export const adapters = {
  User: {
    id: (id: Prisma.User["id"]) => {
      return userNodeId(id);
    },
  },
};
