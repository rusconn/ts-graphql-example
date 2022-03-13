import { UserInputError } from "apollo-server";

import type { QueryNodeArgs } from "@/types";
import { assertIsNodeId } from "@/utils";

export const validations = {
  Query: {
    node: (resolve: any, parent: any, args: QueryNodeArgs, context: any, info: any) => {
      try {
        assertIsNodeId(args.id);
      } catch (e) {
        throw new UserInputError("invalid `id`", { thrown: e });
      }

      return resolve(parent, args, context, info);
    },
  },
};
