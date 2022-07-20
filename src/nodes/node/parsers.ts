import { ParseError } from "@/errors";
import type { QueryNodeArgs } from "@/types";
import { assertIsId } from "@/utils";

export const parsers = {
  Query: {
    node: (args: QueryNodeArgs) => {
      const { id } = args;

      try {
        assertIsId(id);
      } catch (e) {
        throw new ParseError("invalid `id`");
      }

      return { id };
    },
  },
};
