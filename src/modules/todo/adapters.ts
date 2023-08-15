import * as DataSource from "@/datasources";
import * as Graph from "../common/schema";
import { nodeId } from "../common/adapters";
import { nodeType } from "./typeDefs";

const todoNodeId = nodeId(nodeType);

export const adapters = {
  Todo: {
    id: (id: DataSource.Todo["id"]) => {
      return todoNodeId(id);
    },
    status: (status: DataSource.Todo["status"]) => {
      return {
        [DataSource.TodoStatus.DONE]: Graph.TodoStatus.Done,
        [DataSource.TodoStatus.PENDING]: Graph.TodoStatus.Pending,
      }[status];
    },
  },
};
