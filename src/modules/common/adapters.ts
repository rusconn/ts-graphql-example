import type { ID } from "../scalar/adapters";
import { NodeType, typeIdSep } from "./typeDefs";

export const nodeId =
  <T extends NodeType>(type: T) =>
  (id: string) =>
    `${type}${typeIdSep}${id}` as ID;
