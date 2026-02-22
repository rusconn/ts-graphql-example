import type { NodeResolvers } from "../_types.ts";

export const resolver: NodeResolvers["__resolveType"] = (parent, _context) => {
  return parent._type;
};
