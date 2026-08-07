import { buildSchema, parse } from "graphql";
import type {
  DocumentNode,
  FieldNode,
  FragmentDefinitionNode,
  GraphQLField,
  GraphQLFieldMap,
  GraphQLSchema,
  GraphQLType,
  SelectionSetNode,
} from "graphql";
import type { ComplexityEstimator, ComplexityEstimatorArgs } from "graphql-query-complexity";

const introspectionFieldEstimator = ({ field }: ComplexityEstimatorArgs) => {
  return field.name.startsWith("__") ? 0 : undefined;
};

const defaultComplexity = 1;

type ComplexityRequestContext = {
  pluralContext?: Map<FieldNode, PluralContext>;
};

const complexityEstimator = ({
  field,
  childComplexity,
  node,
  context,
}: ComplexityEstimatorArgs) => {
  const directive = readComplexityDirective(field);
  if (directive == null) {
    return undefined;
  }

  const plural = (context as ComplexityRequestContext | undefined)?.pluralContext?.get(node);
  const product = plural?.product ?? 1;
  const exceptNearest = plural?.exceptNearest ?? product;

  if (Array.isArray(directive.multipliers)) {
    return directive.value * product + childComplexity;
  }
  if (isCompositeLike(unwrapNamedType(field.type))) {
    return directive.value + childComplexity;
  }
  const scale = directive.perInstance ? exceptNearest : product;
  return directive.value * scale;
};

const simpleEstimator = ({ field, childComplexity, node, context }: ComplexityEstimatorArgs) => {
  const plural = (context as ComplexityRequestContext | undefined)?.pluralContext?.get(node);
  const product = plural?.product ?? 1;
  if (isCompositeLike(unwrapNamedType(field.type))) {
    return defaultComplexity + childComplexity;
  }
  return defaultComplexity * product;
};

export const complexityEstimators: ComplexityEstimator[] = [
  introspectionFieldEstimator,
  complexityEstimator,
  simpleEstimator,
];

export type PluralContext = {
  /** 自分より上にある複数形(connection等)のpage sizeの積 */
  product: number;
  /** 直近の複数形を除いた積(totalCount,pageInfo等のperInstance用) */
  exceptNearest: number;
};

type ComplexityDirectiveValues = {
  value: number;
  multipliers: readonly string[] | undefined;
  perInstance: boolean;
};

function readComplexityDirective(
  field: GraphQLField<unknown, unknown>,
): ComplexityDirectiveValues | undefined {
  const directive = field.astNode?.directives?.find((d) => d.name.value === "complexity");
  if (directive == null) {
    return undefined;
  }

  let value: number | undefined;
  let multipliers: readonly string[] | undefined;
  let perInstance = false;
  for (const arg of directive.arguments ?? []) {
    switch (arg.name.value) {
      case "value": {
        if (arg.value.kind === "IntValue") {
          value = Number(arg.value.value);
        }
        break;
      }
      case "multipliers": {
        if (arg.value.kind === "ListValue") {
          multipliers = arg.value.values.flatMap((v) =>
            v.kind === "StringValue" ? [v.value] : [],
          );
        }
        break;
      }
      case "perInstance": {
        if (arg.value.kind === "BooleanValue") {
          perInstance = arg.value.value;
        }
        break;
      }
    }
  }
  if (value == null) {
    return undefined;
  }
  return { value, multipliers, perInstance };
}

// 各FieldNodeに「自分より上にある複数形のpage size」の文脈を対応付ける。
// connection(自身にpage sizeがある)は自身のpage sizeを子へ積む。perInstanceフィールドの子は
// 直近の複数形を除いた文脈で歩く。fragment・inline fragment・抽象型・operationName・変数に対応。
export function pluralContext(
  schema: GraphQLSchema,
  document: DocumentNode,
  operationName?: string,
  variables?: Record<string, unknown>,
): Map<FieldNode, PluralContext> {
  const contexts = new Map<FieldNode, PluralContext>();
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const definition of document.definitions) {
    if (definition.kind === "FragmentDefinition") {
      fragments.set(definition.name.value, definition);
    }
  }

  const walk = (
    selectionSet: SelectionSetNode,
    parentType: { getFields(): GraphQLFieldMap<unknown, unknown> },
    ancestors: number[],
    activeFragments: Set<string>,
  ) => {
    const product = ancestors.reduce((acc, count) => acc * count, 1);
    const exceptNearest =
      ancestors.length > 1 ? ancestors.slice(0, -1).reduce((acc, count) => acc * count, 1) : 1;

    for (const selection of selectionSet.selections) {
      switch (selection.kind) {
        case "Field": {
          const fieldDef = parentType.getFields()[selection.name.value];
          if (fieldDef == null) {
            break;
          }
          contexts.set(selection, { product, exceptNearest });
          const fieldType = unwrapNamedType(fieldDef.type);
          if (selection.selectionSet != null && hasFields(fieldType)) {
            const directive = readComplexityDirective(fieldDef);
            if (directive?.perInstance === true) {
              walk(selection.selectionSet, fieldType, ancestors.slice(0, -1), activeFragments);
            } else if (directive != null && Array.isArray(directive.multipliers)) {
              const pageSize = readPageSize(selection, variables ?? {});
              walk(selection.selectionSet, fieldType, [...ancestors, pageSize], activeFragments);
            } else {
              walk(selection.selectionSet, fieldType, ancestors, activeFragments);
            }
          }
          break;
        }
        case "InlineFragment": {
          const fragmentType = selection.typeCondition
            ? schema.getType(selection.typeCondition.name.value)
            : parentType;
          if (fragmentType != null && hasFields(fragmentType)) {
            walk(selection.selectionSet, fragmentType, ancestors, activeFragments);
          }
          break;
        }
        case "FragmentSpread": {
          if (activeFragments.has(selection.name.value)) {
            break;
          }
          const fragment = fragments.get(selection.name.value);
          if (fragment == null) {
            break;
          }
          const fragmentType = schema.getType(fragment.typeCondition.name.value);
          if (fragmentType == null || !hasFields(fragmentType)) {
            break;
          }
          activeFragments.add(fragment.name.value);
          walk(fragment.selectionSet, fragmentType, ancestors, activeFragments);
          activeFragments.delete(fragment.name.value);
          break;
        }
      }
    }
  };

  for (const definition of document.definitions) {
    if (definition.kind !== "OperationDefinition") {
      continue;
    }
    if (operationName != null && definition.name?.value !== operationName) {
      continue;
    }
    const rootType = schema.getRootType(definition.operation);
    if (rootType == null) {
      continue;
    }
    walk(definition.selectionSet, rootType, [], new Set());
  }

  return contexts;
}

function unwrapNamedType(type: GraphQLType): GraphQLType {
  let current = type;
  while ((current as { ofType?: GraphQLType }).ofType != null) {
    current = (current as { ofType: GraphQLType }).ofType;
  }
  return current;
}

// schemaの型オブジェクトに対してgraphqlのinstanceOf系ヘルパーを使わない。テスト環境では
// アプリのschemaを生成するgraphqlコピーと別のgraphqlコピーが読み込まれ得るため、
// 構造ダックタイピング(getFields/getTypesの有無)で判定する。
function isCompositeLike(type: unknown): boolean {
  const t = type as { getFields?: unknown; getTypes?: unknown };
  return typeof t.getFields === "function" || typeof t.getTypes === "function";
}

// schemaの型オブジェクトに対してgraphqlのinstanceOf系ヘルパーを使わない。テスト環境では
// アプリのschemaを生成するgraphqlコピーと別のgraphqlコピーが読み込まれ得るため、
// 構造ダックタイピング(getFieldsの有無)で判定する。
function hasFields(type: unknown): type is { getFields(): GraphQLFieldMap<unknown, unknown> } {
  return typeof (type as { getFields?: unknown }).getFields === "function";
}

// first/lastの値はGraphQLのcoerce済み変数値(Int)かリテラルから読む。数値に変換できない場合は
// 0扱いにする(見積り用のため厳密なcoerceは行わない。検証はgetComplexity側が既に通している)。
function readPageSize(selection: FieldNode, variableValues: Record<string, unknown>): number {
  let max = 0;
  for (const arg of selection.arguments ?? []) {
    if (arg.name.value !== "first" && arg.name.value !== "last") {
      continue;
    }
    let value: unknown;
    if (arg.value.kind === "IntValue") {
      value = Number(arg.value.value);
    } else if (arg.value.kind === "Variable") {
      value = variableValues[arg.value.name.value];
    } else {
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value) && value > max) {
      max = value;
    }
  }
  return max;
}

if (import.meta.vitest) {
  const schema = buildSchema(/* GraphQL */ `
    directive @complexity(
      value: Int!
      multipliers: [String!]
      perInstance: Boolean! = false
    ) on FIELD_DEFINITION

    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
    }

    type Todo {
      id: ID!
      title: String!
    }

    type TodoConnection {
      pageInfo: PageInfo! @complexity(value: 1, perInstance: true)
      nodes: [Todo!]!
      totalCount: Int! @complexity(value: 5, perInstance: true)
    }

    type User {
      id: ID!
      todos(first: Int, last: Int): TodoConnection!
        @complexity(value: 3, multipliers: ["first", "last"])
    }

    type UserConnection {
      pageInfo: PageInfo! @complexity(value: 1, perInstance: true)
      nodes: [User!]!
      totalCount: Int! @complexity(value: 5, perInstance: true)
    }

    type Query {
      viewer: User!
      user(id: ID!): User! @complexity(value: 3)
      users(first: Int, last: Int): UserConnection!
        @complexity(value: 3, multipliers: ["first", "last"])
    }
  `);

  const fields = (typeName: string) => {
    const type = schema.getType(typeName);
    if (!hasFields(type)) {
      throw new Error(`${typeName} not found`);
    }
    return type.getFields();
  };

  const findField = (document: DocumentNode, name: string, nth = 0): FieldNode => {
    const found: FieldNode[] = [];
    const visit = (selectionSet: SelectionSetNode) => {
      for (const selection of selectionSet.selections) {
        if (selection.kind === "Field") {
          if (selection.name.value === name) {
            found.push(selection);
          }
          if (selection.selectionSet != null) {
            visit(selection.selectionSet);
          }
        } else if (selection.kind === "InlineFragment") {
          visit(selection.selectionSet);
        }
      }
    };
    for (const definition of document.definitions) {
      if (definition.kind === "OperationDefinition" || definition.kind === "FragmentDefinition") {
        visit(definition.selectionSet);
      }
    }
    if (found.length <= nth) {
      throw new Error(`${name} not found (nth: ${nth})`);
    }
    return found[nth]!;
  };

  const call = (
    estimator: ComplexityEstimator,
    args: Partial<ComplexityEstimatorArgs>,
  ): number | undefined => {
    const result = estimator({
      field: args.field!,
      args: args.args ?? {},
      childComplexity: args.childComplexity ?? 0,
      type: undefined as never,
      node: args.node as never,
      ...(args.context != null && {
        context: args.context,
      }),
    });
    if (typeof result === "number") {
      return result;
    }
    return undefined;
  };

  const sampleDocument = parse(/* GraphQL */ `
    query {
      users(first: 30) {
        totalCount
        pageInfo {
          hasNextPage
        }
        nodes {
          todos(first: 50) {
            totalCount
            pageInfo {
              hasNextPage
            }
            nodes {
              id
            }
          }
        }
      }
    }
  `);

  const sampleContexts = pluralContext(schema, sampleDocument);

  test("pluralContext: connectionのvalueは祖先の積ではなく1", () => {
    expect(sampleContexts.get(findField(sampleDocument, "users"))).toEqual({
      product: 1,
      exceptNearest: 1,
    });
  });

  test("pluralContext: ネストしたconnectionは親の件数が積まれる", () => {
    expect(sampleContexts.get(findField(sampleDocument, "todos"))).toEqual({
      product: 30,
      exceptNearest: 1,
    });
  });

  test("pluralContext: leafは全ての祖先の積でスケールする", () => {
    expect(sampleContexts.get(findField(sampleDocument, "id"))).toEqual({
      product: 30 * 50,
      exceptNearest: 30,
    });
  });

  test("pluralContext: perInstanceは直近の複数形を除いた積", () => {
    expect(sampleContexts.get(findField(sampleDocument, "totalCount"))).toEqual({
      product: 30,
      exceptNearest: 1,
    });
    expect(sampleContexts.get(findField(sampleDocument, "totalCount", 1))).toEqual({
      product: 30 * 50,
      exceptNearest: 30,
    });
  });

  test("pluralContext: perInstanceの子も直近の複数形を除いた積でスケールする", () => {
    expect(sampleContexts.get(findField(sampleDocument, "hasNextPage"))).toEqual({
      product: 1,
      exceptNearest: 1,
    });
    expect(sampleContexts.get(findField(sampleDocument, "hasNextPage", 1))).toEqual({
      product: 30,
      exceptNearest: 1,
    });
  });

  test("pluralContext: first/last未指定は0として積む", () => {
    const doc = parse(/* GraphQL */ `
      {
        users {
          nodes {
            id
          }
        }
      }
    `);
    const ctx = pluralContext(schema, doc);
    expect(ctx.get(findField(doc, "id"))).toEqual({ product: 0, exceptNearest: 1 });
  });

  test("pluralContext: 変数で解決したfirstを積む", () => {
    const doc = parse(/* GraphQL */ `
      query ($count: Int) {
        users(first: $count) {
          nodes {
            todos(first: 50) {
              nodes {
                id
              }
            }
          }
        }
      }
    `);
    const ctx = pluralContext(schema, doc, undefined, { count: 10 });
    expect(ctx.get(findField(doc, "todos"))).toEqual({ product: 10, exceptNearest: 1 });
    expect(ctx.get(findField(doc, "id"))).toEqual({ product: 10 * 50, exceptNearest: 10 });
  });

  test("pluralContext: FragmentSpreadでも同じ文脈を積む", () => {
    const doc = parse(/* GraphQL */ `
      query {
        users(first: 30) {
          nodes {
            ...Todos
          }
        }
      }
      fragment Todos on User {
        todos(first: 50) {
          nodes {
            id
          }
        }
      }
    `);
    const ctx = pluralContext(schema, doc);
    expect(ctx.get(findField(doc, "todos"))).toEqual({ product: 30, exceptNearest: 1 });
    expect(ctx.get(findField(doc, "id"))).toEqual({ product: 30 * 50, exceptNearest: 30 });
  });

  const withContext = (name: string) => {
    const node = findField(sampleDocument, name);
    return {
      node,
      context: { pluralContext: sampleContexts },
    };
  };

  test("connection: value×product + childComplexity", () => {
    const { node, context } = withContext("todos");
    expect(
      call(complexityEstimator, {
        field: fields("User").todos!,
        node,
        context,
        childComplexity: 4,
      }),
    ).toBe(3 * 30 + 4);
  });

  test("複合フィールド: value + childComplexity (平坦)", () => {
    const { node, context } = withContext("nodes");
    expect(
      call(complexityEstimator, {
        field: fields("TodoConnection").nodes!,
        node,
        context,
        childComplexity: 2,
      }),
    ).toBe(undefined);
    expect(
      call(simpleEstimator, {
        field: fields("TodoConnection").nodes!,
        node,
        context,
        childComplexity: 2,
      }),
    ).toBe(1 + 2);
  });

  test("leaf: value×product", () => {
    const { node, context } = withContext("id");
    expect(call(simpleEstimator, { field: fields("Todo").id!, node, context })).toBe(30 * 50);
  });

  test("leaf + perInstance: value×exceptNearest", () => {
    const node = findField(sampleDocument, "totalCount", 1);
    expect(
      call(complexityEstimator, {
        field: fields("TodoConnection").totalCount!,
        node,
        context: { pluralContext: sampleContexts },
      }),
    ).toBe(5 * 30);
  });

  test("multipliersなしの複合(directiveあり)は平坦", () => {
    const doc = parse(/* GraphQL */ `
      {
        user(id: "1") {
          id
        }
      }
    `);
    const node = findField(doc, "user");
    const context = { pluralContext: pluralContext(schema, doc) };
    expect(
      call(complexityEstimator, {
        field: fields("Query").user!,
        node,
        context,
        childComplexity: 10,
      }),
    ).toBe(3 + 10);
  });

  test("directiveなしはundefinedを返しsimpleEstimatorへ委ねる", () => {
    const { node, context } = withContext("id");
    expect(call(complexityEstimator, { field: fields("Todo").id!, node, context })).toBeUndefined();
  });
}
