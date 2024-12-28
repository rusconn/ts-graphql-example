// @devoxa/prisma-relay-cursor-connection をパクって改造した

import graphqlFields from "graphql-fields";

import type {
  Connection,
  ConnectionArguments,
  Edge,
  GetPageArguments,
  Options,
} from "./interfaces.ts";

export async function getCursorConnection<
  Record = { id: string },
  Cursor = { id: string },
  Node = Record,
  CustomEdge extends Edge<Node> = Edge<Node>,
>(
  getPage: (args: GetPageArguments<Cursor>) => Promise<Record[]>,
  count: () => Promise<number>,
  connArgs: ConnectionArguments = {},
  pOptions?: Options<Record, Cursor, Node, CustomEdge>,
): Promise<Connection<Node, CustomEdge> | Error> {
  const args = parseArgs(connArgs);

  if (args instanceof Error) {
    return args;
  }

  const options = mergeDefaultOptions(pOptions);
  const requestedFields = options.resolveInfo && Object.keys(graphqlFields(options.resolveInfo));
  const hasRequestedField = (key: string) => !requestedFields || requestedFields.includes(key);

  let records: Record[];
  let totalCount: number;
  let hasNextPage: boolean;
  let hasPreviousPage: boolean;

  if (isForwardPagination(args)) {
    [records, totalCount] = await Promise.all([
      getPage({
        cursor: decodeCursor(args.after, options),
        limit: args.first + 1,
        backward: false,
      }),
      hasRequestedField("totalCount") ? count() : -1,
    ]);

    hasPreviousPage = !!args.after;
    hasNextPage = records.length > args.first;

    if (hasNextPage) {
      records.pop();
    }
  } else {
    [records, totalCount] = await Promise.all([
      getPage({
        cursor: decodeCursor(args.before, options),
        limit: args.last + 1,
        backward: true,
      }),
      hasRequestedField("totalCount") ? count() : -1,
    ]);

    hasNextPage = !!args.before;
    hasPreviousPage = records.length > args.last;

    if (hasPreviousPage) {
      records.shift();
    }
  }

  const [startCursor, endCursor] =
    records.length > 0
      ? [encodeCursor(records.at(0)!, options), encodeCursor(records.at(-1)!, options)]
      : [null, null];

  type EdgeExtended = typeof options.recordToEdge extends (record: Record) => infer X
    ? X extends CustomEdge
      ? X & { cursor: string }
      : CustomEdge
    : CustomEdge;

  const edges = records.map((record) => {
    return {
      ...options.recordToEdge(record),
      cursor: encodeCursor(record, options),
    } as EdgeExtended;
  });

  return {
    edges,
    nodes: edges.map((edge) => edge.node),
    pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
    totalCount,
  };
}

function parseArgs(args: ConnectionArguments): ConnectionArgumentsUnion | Error {
  if (args.first == null && args.last == null) {
    return new Error('One of "first" or "last" is required');
  }

  if (args.first != null && args.last != null) {
    return new Error('Only one of "first" and "last" can be set');
  }
  if (args.after != null && args.before != null) {
    return new Error('Only one of "after" and "before" can be set');
  }

  if (args.after != null && args.first == null) {
    return new Error('"after" needs to be used with "first"');
  }
  if (args.before != null && args.last == null) {
    return new Error('"before" needs to be used with "last"');
  }

  if (args.first != null && args.first < 0) {
    return new Error('"first" has to be non-negative integer');
  }
  if (args.last != null && args.last < 0) {
    return new Error('"last" has to be non-negative integer');
  }

  return args as ConnectionArgumentsUnion;
}

type ConnectionArgumentsUnion = ForwardPaginationArguments | BackwardPaginationArguments;

type ForwardPaginationArguments = {
  first: number;
  after?: string;
  last?: undefined;
  before?: undefined;
};

type BackwardPaginationArguments = {
  first?: undefined;
  after?: undefined;
  last: number;
  before?: string;
};

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

function isForwardPagination(args: ConnectionArgumentsUnion) {
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

if (import.meta.vitest) {
  const getPage = async () => [];
  const count = async () => 0;

  describe("Parsing", () => {
    const valids = [
      { first: 0 },
      { first: 0, after: "" },
      { first: 10, after: "" },
      { last: 0 },
      { last: 0, before: "" },
      { last: 10, before: "" },
    ];

    const invalids = [
      {},
      { first: null },
      { last: null },
      { first: null, last: null },
      { first: 10, last: 10 },
      { first: 10, before: "" },
      { last: 10, after: "" },
      { first: -1 },
      { last: -1 },
      { after: "" },
      { before: "" },
    ];

    test.each(valids)("valids %#", async (args) => {
      const result = await getCursorConnection(getPage, count, args);
      expect(result instanceof Error).toBe(false);
    });

    test.each(invalids)("invalids %#", async (args) => {
      const result = await getCursorConnection(getPage, count, args);
      expect(result instanceof Error).toBe(true);
    });
  });

  describe("Callback backward", () => {
    const forwards = [{ first: 1 }, { first: 10, after: "" }];
    const backwards = [{ last: 1 }, { last: 10, before: "" }];

    test.each(forwards)("forwards %#", async (args) => {
      await getCursorConnection(
        ({ backward }) => {
          expect(backward).toBe(false);
          return Promise.resolve([]);
        },
        count,
        args,
      );
    });

    test.each(backwards)("backwards %#", async (args) => {
      await getCursorConnection(
        ({ backward }) => {
          expect(backward).toBe(true);
          return Promise.resolve([]);
        },
        count,
        args,
      );
    });
  });

  describe("Result direction", () => {
    const forwards = [{ first: 2, after: "" }];
    const backwards = [{ last: 2, before: "" }];

    const getPage = async () => [{ id: 1 }, { id: 2 }];

    test.each(forwards)("forwards %#", async (args) => {
      const result = await getCursorConnection(getPage, count, args);
      if (result instanceof Error) {
        throw new Error();
      }
      expect(result.nodes).toStrictEqual(await getPage());
    });

    test.each(backwards)("backwards %#", async (args) => {
      const result = await getCursorConnection(getPage, count, args);
      if (result instanceof Error) {
        throw new Error();
      }
      expect(result.nodes).toStrictEqual(await getPage());
    });
  });
}
