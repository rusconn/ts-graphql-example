import type { ID } from "../scalar";
import { NodeType, typeIdSep } from "./typeDefs";

export const nodeId =
  <T extends NodeType>(type: T) =>
  (id: string) =>
    `${type}${typeIdSep}${id}` as ID;
