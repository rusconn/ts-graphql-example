import { GraphQLError } from "graphql";
import { shield } from "graphql-shield";

import * as DataSource from "@/datasources";
import * as Graph from "@/modules/common/schema";
import { ParseError } from "@/modules/common/parsers";
import { permissions } from "./permissions";

const permissionAndErrorMiddleware = shield(permissions, {
  // ログの為に埋め込んだ内部情報はサーバーの設定でレスポンスから除外すること
  fallbackError: (thrown, _parent, _args, _context, _info) => {
    if (thrown instanceof ParseError) {
      return new GraphQLError(thrown.message, {
        originalError: thrown,
        extensions: { code: Graph.ErrorCode.BadUserInput },
      });
    }

    if (thrown instanceof DataSource.NotFoundError) {
      return new GraphQLError("Not found", {
        originalError: thrown,
        extensions: { code: Graph.ErrorCode.NotFound },
      });
    }

    if (thrown instanceof GraphQLError) {
      return thrown;
    }

    // 想定外のエラーが投げられた
    if (thrown instanceof Error) {
      return new GraphQLError("Internal server error", {
        originalError: thrown,
        extensions: { code: Graph.ErrorCode.InternalServerError },
      });
    }

    // エラーでは無いものが投げられた
    return new GraphQLError("Internal server error", {
      extensions: { code: Graph.ErrorCode.InternalServerError, thrown },
    });
  },
});

export const middlewares = [permissionAndErrorMiddleware];
