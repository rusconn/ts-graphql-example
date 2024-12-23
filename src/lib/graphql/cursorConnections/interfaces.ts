import type { GraphQLResolveInfo } from "graphql";

export interface Options<Record, Cursor, Node, CustomEdge extends Edge<Node>> {
  getCursor?: (record: Record) => Cursor;
  encodeCursor?: (cursor: Cursor) => string;
  decodeCursor?: (cursorString: string) => Cursor;
  recordToEdge?: (record: Record) => Omit<CustomEdge, "cursor">;
  resolveInfo?: GraphQLResolveInfo | null;
}

export interface GetPageArguments<Cursor> {
  cursor?: Cursor;
  limit: number;
  backward: boolean;
}

export interface ConnectionArguments {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
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
