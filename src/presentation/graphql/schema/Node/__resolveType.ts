import type { NodeResolvers } from "../_types.ts";

export const resolver: NodeResolvers["__resolveType"] = (parent) => {
  return parent._type;
};
