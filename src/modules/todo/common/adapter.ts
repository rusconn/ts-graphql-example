import * as Prisma from "@/prisma/mod.ts";
import { nodeId } from "../../common/adapters.ts";
import { TodoStatus } from "../../common/schema.ts";

export const todoNodeId = nodeId("Todo");

export const todoStatus = (status: Prisma.Todo["status"]) => {
  return {
    [Prisma.TodoStatus.DONE]: TodoStatus.Done,
    [Prisma.TodoStatus.PENDING]: TodoStatus.Pending,
  }[status];
};
