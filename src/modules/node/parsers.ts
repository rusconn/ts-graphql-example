import type * as Graph from "../common/schema";
import { ParseError, splitNodeId } from "../common/parsers";

const parseNodeId = (id: Graph.Node["id"]) => {
  try {
    return splitNodeId(id);
  } catch (e) {
    if (e instanceof Error) {
      throw new ParseError(e);
    }

    throw e;
  }
};

export const parsers = {
  Query: {
    node: ({ id }: Graph.QueryNodeArgs) => {
      return parseNodeId(id);
    },
  },
};
