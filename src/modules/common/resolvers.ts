import { PrismaSelect } from "@paljs/plugins";
import type { GraphQLResolveInfo } from "graphql";
import type { Logger } from "pino";

import type * as DataSource from "@/datasources";

export type WithSelect<T, U extends DataSource.SelectScalar> = T & { select?: U };

export type Context = {
  logger: Logger;
  user: Pick<DataSource.User, "id" | "role"> | { id: "GUEST"; role: "GUEST" };
  dataSources: {
    prisma: DataSource.PrismaClient;
  };
};

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
