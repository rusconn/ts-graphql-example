// @devoxa/prisma-relay-cursor-connection をパクって改造した

import getFieldNames from "graphql-list-fields";

import type {
  Connection,
  ConnectionArgumentsUnion,
  Edge,
  GetPageArguments,
  Options,
} from "./interfaces.ts";
import { isForwardPagination } from "./util.ts";

export async function getCursorConnection<
  Item = { id: string },
  Cursor = string,
  Node = Item,
  CustomEdge extends Edge<Node> = Edge<Node>,
>(
  getPage: (args: GetPageArguments<Cursor>) => Promise<Item[]>,
  count: () => Promise<number>,
  args: ConnectionArgumentsUnion<Cursor>,
  pOptions?: Options<Item, Cursor, Node, CustomEdge>,
): Promise<Connection<Node, CustomEdge>> {
  const options = mergeDefaultOptions(pOptions);
  const requestedFields = options.resolveInfo && getFieldNames(options.resolveInfo, 1);
  const hasRequestedField = (key: string) => !requestedFields || requestedFields.includes(key);

  let items: Item[];
  let totalCount: number;
  let hasNextPage: boolean;
  let hasPreviousPage: boolean;

  if (isForwardPagination(args)) {
    [items, totalCount] = await Promise.all([
      getPage({
        backward: false,
        ...(args.after != null && { cursor: args.after }),
        limit: args.first + 1,
      }),
      hasRequestedField("totalCount") ? count() : -1,
    ]);

    hasPreviousPage = !!args.after;
    hasNextPage = items.length > args.first;

    if (hasNextPage) {
      items.pop();
    }
  } else {
    [items, totalCount] = await Promise.all([
      getPage({
        backward: true,
        ...(args.before != null && { cursor: args.before }),
        limit: args.last + 1,
      }),
      hasRequestedField("totalCount") ? count() : -1,
    ]);

    hasNextPage = !!args.before;
    hasPreviousPage = items.length > args.last;

    if (hasPreviousPage) {
      items.pop();
    }

    items.reverse();
  }

  const [startCursor, endCursor] =
    items.length > 0
      ? [encodeCursor(items.at(0)!, options), encodeCursor(items.at(-1)!, options)]
      : [null, null];

  type EdgeExtended = typeof options.itemToEdge extends (item: Item) => infer X
    ? X extends CustomEdge
      ? X & { cursor: string }
      : CustomEdge
    : CustomEdge;

  const edges = items.map((item) => {
    return {
      ...options.itemToEdge(item),
      cursor: encodeCursor(item, options),
    } as EdgeExtended;
  });

  return {
    edges,
    nodes: edges.map((edge) => edge.node),
    pageInfo: { hasNextPage, hasPreviousPage, startCursor, endCursor },
    totalCount,
  };
}

type MergedOptions<Item, Cursor, Node, CustomEdge extends Edge<Node>> = Required<
  Options<Item, Cursor, Node, CustomEdge>
>;

function mergeDefaultOptions<Item, Cursor, Node, CustomEdge extends Edge<Node>>(
  pOptions?: Options<Item, Cursor, Node, CustomEdge>,
): MergedOptions<Item, Cursor, Node, CustomEdge> {
  return {
    getCursor: (item: Item) => (item as { id: string }).id as Cursor,
    encodeCursor: (cursor: Cursor) => cursor as string,
    itemToEdge: (item: Item) => ({ node: item }) as unknown as Omit<CustomEdge, "cursor">,
    resolveInfo: null,
    ...pOptions,
  };
}

function encodeCursor<Item, Cursor, Node, CustomEdge extends Edge<Node>>(
  item: Item,
  options: MergedOptions<Item, Cursor, Node, CustomEdge>,
): string {
  return options.encodeCursor(options.getCursor(item));
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
