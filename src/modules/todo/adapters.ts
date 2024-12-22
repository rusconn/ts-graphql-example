import { TodoStatus } from "../../db/types.ts";
import * as Graph from "../../schema.ts";
import { nodeId } from "../common/adapters.ts";
import type { Todo } from "./resolvers.ts";

export const todoNodeId = nodeId("Todo");

export const todoStatus = (status: Todo["status"]) => {
  return {
    [TodoStatus.DONE]: Graph.TodoStatus.Done,
    [TodoStatus.PENDING]: Graph.TodoStatus.Pending,
  }[status];
};
