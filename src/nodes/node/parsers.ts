import { UserInputError } from "apollo-server";

import type { QueryNodeArgs } from "@/types";
import { assertIsNodeId } from "@/utils";

export const parsers = {
  Query: {
    node: (args: QueryNodeArgs) => {
      const { id } = args;

      try {
        assertIsNodeId(id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return { nodeId: id };
    },
  },
};
