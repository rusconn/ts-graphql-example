// @devoxa/prisma-relay-cursor-connection をパクって改造した

import type { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";

export async function getCursorConnections<
  Record = { id: string },
  Cursor = { id: string },
  Node = Record,
  CustomEdge extends Edge<Node> = Edge<Node>,
>(
  getPage: (args: GetPageArguments<Cursor>) => Promise<Record[]>,
  count: () => Promise<number>,
  parseError: (message: string) => Error,
  connArgs: ConnectionArguments = {},
  pOptions?: Options<Record, Cursor, Node, CustomEdge>,
): Promise<Connection<Node, CustomEdge>> {
  const args = parseArgs(connArgs);

  if (typeof args === "string") {
    throw parseError(args);
  }

  const options = mergeDefaultOptions(pOptions);
  const requestedFields = options.resolveInfo && Object.keys(graphqlFields(options.resolveInfo));
  const hasRequestedField = (key: string) => !requestedFields || requestedFields.includes(key);

  let records: Record[];
  let totalCount: number;
  let hasNextPage: boolean;
  let hasPreviousPage: boolean;

  if (isForwardPagination(args)) {
    // Fetch one additional record to determine if there is a next page
    const limit = args.first + 1;

    const cursor = decodeCursor(args.after, options);
    const offset = cursor ? 1 : undefined;

    const results = await Promise.all([
      getPage({ cursor, limit, offset, backward: false }),
      hasRequestedField("totalCount") ? count() : -1,
    ]);
    records = results[0];
    totalCount = results[1];

    // See if we are "after" another record, indicating a previous page
    hasPreviousPage = !!args.after;

    // See if we have an additional record, indicating a next page
    hasNextPage = records.length > args.first;

    // Remove the extra record (last element) from the results
    if (hasNextPage) {
      records.pop();
    }
  } else {
    // Fetch one additional record to determine if there is a previous page
    const limit = args.last + 1;

    const cursor = decodeCursor(args.before, options);
    const offset = cursor ? 1 : undefined;

    const results = await Promise.all([
      getPage({ cursor, limit, offset, backward: true }),
      hasRequestedField("totalCount") ? count() : -1,
    ]);
    records = results[0];
    totalCount = results[1];

    // See if we are "before" another record, indicating a next page
    hasNextPage = !!args.before;

    // See if we have an additional record, indicating a previous page
    hasPreviousPage = records.length > args.last;

    // Remove the extra record (first element) from the results
    if (hasPreviousPage) {
      records.shift();
    }
  }

  // The cursors are always the first & last elements of the result set
  const startCursor = records.length > 0 ? encodeCursor(records[0], options) : undefined;
  const endCursor =
    records.length > 0 ? encodeCursor(records[records.length - 1], options) : undefined;

  // Allow the recordToEdge function to return a custom edge type which will be inferred
  type EdgeExtended = typeof options.recordToEdge extends (record: Record) => infer X
    ? X extends CustomEdge
      ? X & { cursor: string }
      : CustomEdge
    : CustomEdge;

  const edges = records.map(record => {
    return {
      ...options.recordToEdge(record),
      cursor: encodeCursor(record, options),
    } as EdgeExtended;
  });

  return {
    edges,
    nodes: edges.map(edge => edge.node),
    pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
    totalCount,
  };
}

function parseArgs(args: ConnectionArguments): ConnectionArgumentsUnion | string {
  if (args.first == null && args.last == null) {
    return 'One of "first" or "last" is required';
  }

  if (args.first != null && args.last != null) {
    return 'Only one of "first" and "last" can be set';
  }
  if (args.after != null && args.before != null) {
    return 'Only one of "after" and "before" can be set';
  }

  if (args.after != null && args.first == null) {
    return '"after" needs to be used with "first"';
  }
  if (args.before != null && args.last == null) {
    return '"before" needs to be used with "last"';
  }

  if (args.first != null && args.first <= 0) {
    return '"first" has to be positive';
  }
  if (args.last != null && args.last <= 0) {
    return '"last" has to be positive';
  }

  return args as ConnectionArgumentsUnion;
}

type ConnectionArgumentsUnion = ForwardPaginationArguments | BackwardPaginationArguments;

type ForwardPaginationArguments = { first: number; after?: string };
type BackwardPaginationArguments = { last: number; before?: string };

type MergedOptions<Record, Cursor, Node, CustomEdge extends Edge<Node>> = Required<
  Options<Record, Cursor, Node, CustomEdge>
>;

function mergeDefaultOptions<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  pOptions?: Options<Record, Cursor, Node, CustomEdge>,
): MergedOptions<Record, Cursor, Node, CustomEdge> {
  return {
    getCursor: (record: Record) =>
      ({ id: (record as unknown as { id: string }).id }) as unknown as Cursor,
    encodeCursor: (cursor: Cursor) => (cursor as unknown as { id: string }).id,
    decodeCursor: (cursorString: string) => ({ id: cursorString }) as unknown as Cursor,
    recordToEdge: (record: Record) => ({ node: record }) as unknown as Omit<CustomEdge, "cursor">,
    resolveInfo: null,
    ...pOptions,
  };
}

function isForwardPagination(args: ConnectionArgumentsUnion): args is ForwardPaginationArguments {
  return "first" in args && args.first != null;
}

function decodeCursor<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  connectionCursor: string | undefined,
  options: MergedOptions<Record, Cursor, Node, CustomEdge>,
): Cursor | undefined {
  return connectionCursor ? options.decodeCursor(connectionCursor) : undefined;
}

function encodeCursor<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  record: Record,
  options: MergedOptions<Record, Cursor, Node, CustomEdge>,
): string {
  return options.encodeCursor(options.getCursor(record));
}

interface Options<Record, Cursor, Node, CustomEdge extends Edge<Node>> {
  getCursor?: (record: Record) => Cursor;
  encodeCursor?: (cursor: Cursor) => string;
  decodeCursor?: (cursorString: string) => Cursor;
  recordToEdge?: (record: Record) => Omit<CustomEdge, "cursor">;
  resolveInfo?: GraphQLResolveInfo | null;
}

interface GetPageArguments<Cursor> {
  cursor?: Cursor;
  limit?: number;
  offset?: number;
  backward: boolean;
}

interface ConnectionArguments {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
}

interface Connection<T, CustomEdge extends Edge<T> = Edge<T>> {
  nodes: T[];
  edges: CustomEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

interface Edge<T> {
  cursor: string;
  node: T;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

if (import.meta.vitest) {
  const getPage = async () => [];
  const count = async () => 0;
  const parseError = () => new Error();

  describe("Parsing", () => {
    const valids = [
      { first: 1, after: "" },
      { last: 1, before: "" },
    ];

    const invalids = [
      {},
      { first: null },
      { last: null },
      { first: null, last: null },
      { first: 1, last: 1 },
      { first: 1, before: "" },
      { last: 1, after: "" },
      { first: 0 },
      { first: -1 },
      { last: 0 },
      { last: -1 },
      { after: "" },
      { before: "" },
    ];

    test.each(valids)("valids %#", args => {
      expect(getCursorConnections(getPage, count, parseError, args)).resolves.not.toThrow(
        parseError(),
      );
    });

    test.each(invalids)("invalids %#", args => {
      expect(getCursorConnections(getPage, count, parseError, args)).rejects.toThrow(parseError());
    });
  });

  describe("Callback backward", () => {
    const forwards = [{ first: 1 }, { first: 10, after: "" }];
    const backwards = [{ last: 1 }, { last: 10, before: "" }];

    test.each(forwards)("forwards %#", async args => {
      await getCursorConnections(
        ({ backward }) => {
          expect(backward).toBe(false);
          return Promise.resolve([]);
        },
        count,
        parseError,
        args,
      );
    });

    test.each(backwards)("backwards %#", async args => {
      await getCursorConnections(
        ({ backward }) => {
          expect(backward).toBe(true);
          return Promise.resolve([]);
        },
        count,
        parseError,
        args,
      );
    });
  });

  describe("Result direction", () => {
    const forwards = [{ first: 2, after: "" }];
    const backwards = [{ last: 2, before: "" }];

    const getPage = async () => [{ id: 1 }, { id: 2 }];

    test.each(forwards)("forwards %#", async args => {
      const result = await getCursorConnections(getPage, count, parseError, args);
      expect(result.nodes).toStrictEqual(await getPage());
    });

    test.each(backwards)("backwards %#", async args => {
      const result = await getCursorConnections(getPage, count, parseError, args);
      expect(result.nodes).toStrictEqual(await getPage());
    });
  });
}
