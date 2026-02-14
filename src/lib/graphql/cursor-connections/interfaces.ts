import type { GraphQLResolveInfo } from "graphql";

export interface GetPageArguments<Cursor> {
  backward: boolean;
  cursor?: Cursor;
  limit: number;
}

export type ConnectionArgumentsUnion<Cursor = string> =
  | { first: number; after?: Cursor }
  | { last: number; before?: Cursor };

export interface Options<Item, Cursor, Node, CustomEdge extends Edge<Node>> {
  getCursor?: (item: Item) => Cursor;
  encodeCursor?: (cursor: Cursor) => string;
  itemToEdge?: (item: Item) => Omit<CustomEdge, "cursor">;
  resolveInfo?: GraphQLResolveInfo | null;
}

export interface Connection<T, CustomEdge extends Edge<T> = Edge<T>> {
  nodes: T[];
  edges: CustomEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

export interface ConnectionArguments {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}
