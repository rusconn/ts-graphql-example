import { UserInputError } from "apollo-server";

import type { QueryNodeArgs } from "@/types";
import { assertIsNodeId } from "@/utils";

export const validations = {
  Query: {
    node: (args: QueryNodeArgs) => {
      try {
        assertIsNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }
    },
  },
};
