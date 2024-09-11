import * as DB from "@/db/mod.ts";
import { nodeId } from "../../common/adapters.ts";
import { TodoStatus } from "../../common/schema.ts";

export const todoNodeId = nodeId("Todo");

export const todoStatus = (status: DB.TodoSelect["status"]) => {
  return {
    [DB.TodoStatus.DONE]: TodoStatus.Done,
    [DB.TodoStatus.PENDING]: TodoStatus.Pending,
  }[status];
};
