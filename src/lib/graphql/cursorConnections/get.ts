// @devoxa/prisma-relay-cursor-connection をパクって改造した

import graphqlFields from "graphql-fields";

import type {
  Connection,
  ConnectionArgumentsUnion,
  Edge,
  GetPageArguments,
  Options,
} from "./interfaces.ts";
import { isForwardPagination } from "./util.ts";

export async function getCursorConnection<
  Record = { id: string },
  Cursor = string,
  Node = Record,
  CustomEdge extends Edge<Node> = Edge<Node>,
>(
  getPage: (args: GetPageArguments<Cursor>) => Promise<Record[]>,
  count: () => Promise<number>,
  args: ConnectionArgumentsUnion<Cursor>,
  pOptions?: Options<Record, Cursor, Node, CustomEdge>,
): Promise<Connection<Node, CustomEdge>> {
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
        backward: false,
        ...(args.after != null && { cursor: args.after }),
        limit: args.first + 1,
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
        backward: true,
        ...(args.before != null && { cursor: args.before }),
        limit: args.last + 1,
      }),
      hasRequestedField("totalCount") ? count() : -1,
    ]);

    hasNextPage = !!args.before;
    hasPreviousPage = records.length > args.last;

    if (hasPreviousPage) {
      records.pop();
    }

    records.reverse();
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

type MergedOptions<Record, Cursor, Node, CustomEdge extends Edge<Node>> = Required<
  Options<Record, Cursor, Node, CustomEdge>
>;

function mergeDefaultOptions<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  pOptions?: Options<Record, Cursor, Node, CustomEdge>,
): MergedOptions<Record, Cursor, Node, CustomEdge> {
  return {
    getCursor: (record: Record) => (record as { id: string }).id as Cursor,
    encodeCursor: (cursor: Cursor) => cursor as string,
    recordToEdge: (record: Record) => ({ node: record }) as unknown as Omit<CustomEdge, "cursor">,
    resolveInfo: null,
    ...pOptions,
  };
}

function encodeCursor<Record, Cursor, Node, CustomEdge extends Edge<Node>>(
  record: Record,
  options: MergedOptions<Record, Cursor, Node, CustomEdge>,
): string {
  return options.encodeCursor(options.getCursor(record));
}

if (import.meta.vitest) {
  const count = async () => 0;

  describe("Callback backward", () => {
    const forwards = [
      { first: 1 }, //
      { first: 10, after: "" },
    ];

    const backwards = [
      { last: 1 }, //
      { last: 10, before: "" },
    ];

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
    const forwards = [
      { first: 2, after: "" }, //
    ];

    const backwards = [
      { last: 2, before: "" }, //
    ];

    const getPage = async () => [{ id: 1 }, { id: 2 }];

    test.each(forwards)("forwards %#", async (args) => {
      const result = await getCursorConnection(getPage, count, args);
      expect(result.nodes).toStrictEqual(await getPage());
    });

    test.each(backwards)("backwards %#", async (args) => {
      const result = await getCursorConnection(getPage, count, args);
      expect(result.nodes).toStrictEqual((await getPage()).toReversed());
    });
  });
}
