import { PrismaSelect } from "@paljs/plugins";
import type { GraphQLResolveInfo } from "graphql";

import type * as DataSource from "@/datasources";

/**
 * prisma の select オプション値を作成する。
 *
 * WARNING: GraphQL スキーマの Union type には対応していない。
 *
 * WARNING: GraphQL スキーマの Scalar type と prisma モデルの SelectScalar の互換性に依存してしまっている。
 * 非互換の場合、prisma のクエリ実行時に PrismaClientValidationError が発生してしまう。
 * この問題に対応するには両者の対応関係を考慮した select 作成ロジックが必要。
 */
export const selectInfo = <T extends DataSource.SelectScalar>(info: GraphQLResolveInfo) => {
  return new PrismaSelect(info).value as { select?: T };
};
