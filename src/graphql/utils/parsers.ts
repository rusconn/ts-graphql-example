import { splitNodeId, splitTodoNodeId, splitUserNodeId } from "@/adapters";
import { ParseError } from "@/errors";
import type { Graph } from "@/graphql/types";

export const parseNodeId = (id: Graph.Node["id"]) => {
  try {
    return splitNodeId(id);
  } catch (e) {
    if (e instanceof Error) {
      throw new ParseError(e);
    }

    throw e;
  }
};

export const parseTodoNodeId = (id: Graph.Node["id"]) => {
  try {
    return splitTodoNodeId(id).id;
  } catch (e) {
    if (e instanceof Error) {
      throw new ParseError(e);
    }

    throw e;
  }
};

export const parseUserNodeId = (id: Graph.Node["id"]) => {
  try {
    return splitUserNodeId(id).id;
  } catch (e) {
    if (e instanceof Error) {
      throw new ParseError(e);
    }

    throw e;
  }
};
