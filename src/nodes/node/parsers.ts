import { ParseError } from "@/errors";
import type { QueryNodeArgs } from "@/types";
import { isId } from "@/utils";

export const parsers = {
  Query: {
    node: (args: QueryNodeArgs) => {
      const { id } = args;

      if (!isId(id)) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
  },
};
