import * as Prisma from "@/prisma";
import * as Graph from "../common/schema";
import { nodeId } from "../common/adapters";
import { nodeType } from "./typeDefs";

const todoNodeId = nodeId(nodeType);

export const adapters = {
  Todo: {
    id: (id: Prisma.Todo["id"]) => {
      return todoNodeId(id);
    },
    status: (status: Prisma.Todo["status"]) => {
      return {
        [Prisma.TodoStatus.DONE]: Graph.TodoStatus.Done,
        [Prisma.TodoStatus.PENDING]: Graph.TodoStatus.Pending,
      }[status];
    },
  },
};
