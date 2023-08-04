import { GraphQLError } from "graphql";
import { shield } from "graphql-shield";

import * as DataSource from "@/datasources";
import { ParseError } from "./errors";
import { permissions } from "./permissions";
import { Graph } from "./types";

const permissionAndErrorMiddleware = shield(permissions, {
  // ログの為に埋め込んだ内部情報はサーバーの設定でレスポンスから除外すること
  fallbackError: (thrown, _parent, _args, _context, _info) => {
    if (thrown instanceof ParseError) {
      throw new GraphQLError(thrown.message, {
        originalError: thrown,
        extensions: { code: Graph.ErrorCode.BadUserInput },
      });
    }

    if (thrown instanceof DataSource.NotFoundError) {
      throw new GraphQLError("Not found", {
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
