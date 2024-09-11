import type { TodoSelect } from "../../../db/models.ts";
import { TodoStatus } from "../../../db/types.ts";
import * as Graph from "../../../schema.ts";
import { nodeId } from "../../common/adapters.ts";

export const todoNodeId = nodeId("Todo");

export const todoStatus = (status: TodoSelect["status"]) => {
  return {
    [TodoStatus.DONE]: Graph.TodoStatus.Done,
    [TodoStatus.PENDING]: Graph.TodoStatus.Pending,
  }[status];
};
