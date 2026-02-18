import type { NodeResolvers } from "../_schema.ts";

export const resolver: NodeResolvers["__resolveType"] = (parent, _context) => {
  return parent._type;
};
