import * as DataSource from "@/datasources";
import * as Graph from "../common/schema";
import { toSpecifiedNodeId } from "../common/adapters";
import { nodeType } from "./typeDefs";

const toTodoNodeId = toSpecifiedNodeId(nodeType);

export const adapters = {
  Todo: {
    id: (id: DataSource.Todo["id"]) => {
      return toTodoNodeId(id);
    },
    status: (status: DataSource.Todo["status"]) => {
      return {
        [DataSource.TodoStatus.DONE]: Graph.TodoStatus.Done,
        [DataSource.TodoStatus.PENDING]: Graph.TodoStatus.Pending,
      }[status];
    },
  },
};
