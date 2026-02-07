import * as Db from "../../../db/types.ts";
import * as Graph from "../../../schema.ts";

export const todoStatus = (status: Db.Todo["status"]): NonNullable<Graph.Todo["status"]> => {
  return map[status];
};

const map: Record<Db.TodoStatus, NonNullable<Graph.Todo["status"]>> = {
  [Db.TodoStatus.Done]: Graph.TodoStatus.Done,
  [Db.TodoStatus.Pending]: Graph.TodoStatus.Pending,
};
