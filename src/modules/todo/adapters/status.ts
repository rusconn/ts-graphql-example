import { TodoStatus } from "../../../db/generated/types.ts";
import * as Graph from "../../../schema.ts";
import type { Todo } from "../mapper.ts";

export const todoStatus = (status: Todo["status"]) => {
  return {
    [TodoStatus.DONE]: Graph.TodoStatus.Done,
    [TodoStatus.PENDING]: Graph.TodoStatus.Pending,
  }[status];
};
