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
    createdAt: (createdAt: DataSource.Todo["createdAt"]) => {
      return createdAt;
    },
    updatedAt: (updatedAt: DataSource.Todo["updatedAt"]) => {
      return updatedAt;
    },
    title: (title: DataSource.Todo["title"]) => {
      return title;
    },
    description: (description: DataSource.Todo["description"]) => {
      return description;
    },
    status: (status: DataSource.Todo["status"]) => {
      return {
        [DataSource.TodoStatus.DONE]: Graph.TodoStatus.Done,
        [DataSource.TodoStatus.PENDING]: Graph.TodoStatus.Pending,
      }[status];
    },
  },
};
