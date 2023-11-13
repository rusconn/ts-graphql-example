import * as Prisma from "@/prisma/mod.js";
import { nodeId } from "../../common/adapters.js";
import { TodoStatus } from "../../common/schema.js";

export const todoNodeId = nodeId("Todo");

export const todoStatus = (status: Prisma.Todo["status"]) => {
  return {
    [Prisma.TodoStatus.DONE]: TodoStatus.Done,
    [Prisma.TodoStatus.PENDING]: TodoStatus.Pending,
  }[status];
};
