import type * as Model from "../../models/todo.ts";
import type * as Graph from "../../schema.ts";
import { columnsUnchecked, connectionColumnsUnchecked } from "../_mappers/columns.ts";

export type Todo = Partial<Model.Todo>;

const map: Record<keyof Graph.Todo, keyof Model.Todo | null> = {
  __typename: null,
  createdAt: "id",
  description: "description",
  id: "id",
  status: "status",
  title: "title",
  updatedAt: "updatedAt",
  user: "userId",
};

export const todoColumnsUnchecked = columnsUnchecked(map);
export const todoConnectionColumnsUnchecked = connectionColumnsUnchecked(map, ["id"] as const);
