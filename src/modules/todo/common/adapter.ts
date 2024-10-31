import { TodoStatus } from "../../../db/types.ts";
import { nodeId } from "../../common/adapters.ts";
import * as Graph from "../../common/schema.ts";
import type { Todo } from "./resolver.ts";

export const todoNodeId = nodeId("Todo");

export const todoStatus = (status: Todo["status"]) => {
  return {
    [TodoStatus.DONE]: Graph.TodoStatus.Done,
    [TodoStatus.PENDING]: Graph.TodoStatus.Pending,
  }[status];
};
