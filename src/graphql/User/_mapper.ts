import type * as Model from "../../models/user.ts";
import type * as Graph from "../../schema.ts";
import { columnsUnchecked, connectionColumnsUnchecked } from "../_mappers/columns.ts";

export type User = Partial<Model.User>;

const map: Record<keyof Graph.User, keyof Model.User | null> = {
  __typename: null,
  createdAt: "id",
  email: "email",
  id: "id",
  name: "name",
  todo: "id",
  todos: "id",
  updatedAt: "updatedAt",
};

export const userColumnsUnchecked = columnsUnchecked(map);
export const userConnectionColumnsUnchecked = connectionColumnsUnchecked(map, ["id"] as const);
