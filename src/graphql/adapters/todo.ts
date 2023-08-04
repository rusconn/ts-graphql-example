import * as DataSource from "@/datasources";
import { Graph } from "@/graphql/types";
import { dateTime, nonEmptyString } from "@/graphql/utils";
import { splitSpecifiedNodeId, toSpecifiedNodeId } from "./node";

const toTodoNodeId = toSpecifiedNodeId("Todo");
export const splitTodoNodeId = splitSpecifiedNodeId("Todo");

export const adapters = {
  Todo: {
    id: (id: DataSource.Todo["id"]) => {
      return toTodoNodeId(id);
    },
    createdAt: (createdAt: DataSource.Todo["createdAt"]) => {
      return dateTime(createdAt.toISOString());
    },
    updatedAt: (updatedAt: DataSource.Todo["updatedAt"]) => {
      return dateTime(updatedAt.toISOString());
    },
    title: (title: DataSource.Todo["title"]) => {
      return nonEmptyString(title);
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
