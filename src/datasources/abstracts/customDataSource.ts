import type { KeyValueCache } from "apollo-server-core";
import { DataSource, DataSourceConfig } from "apollo-datasource";

import type { Context } from "@/types";

export abstract class CustomDataSource extends DataSource {
  // initialize() で必ず設定されるので non-null
  protected context!: Context;

  protected cache!: KeyValueCache;

  override initialize({ context, cache }: DataSourceConfig<Context>) {
    this.context = context;
    this.cache = cache;
  }
}
