import {
  ColumnNode,
  ColumnUpdateNode,
  type KyselyPlugin,
  type PluginTransformQueryArgs,
  type PluginTransformResultArgs,
  type QueryResult,
  type RootOperationNode,
  type UnknownRow,
  ValueNode,
} from "kysely";

export class UpdatedAtPlugin implements KyselyPlugin {
  transformQuery(args: PluginTransformQueryArgs): RootOperationNode {
    if (args.node.kind === "UpdateQueryNode") {
      const arr: ColumnUpdateNode[] = [];

      arr.push(...args.node.updates!);
      arr.push(
        ColumnUpdateNode.create(
          ColumnNode.create("updatedAt"),
          ValueNode.create(new Date().toISOString()),
        ),
      );

      return {
        ...args.node,
        updates: arr,
      };
    }

    return args.node;
  }

  transformResult(args: PluginTransformResultArgs): Promise<QueryResult<UnknownRow>> {
    return Promise.resolve(args.result);
  }
}
