import type * as Graph from "../common/schema";
import { parseNodeId } from "../common/parsers";

export const parsers = {
  Query: {
    node: ({ id }: Graph.QueryNodeArgs) => {
      return parseNodeId(id);
    },
  },
};
