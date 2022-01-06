import { shield } from "graphql-shield";
import { ApolloError } from "apollo-server";

import { ErrorCode } from "@/types";
import { permissions } from "@/permissions";
import { validations } from "@/validations";

const permissionAndErrorMiddleware = shield(permissions, {
  // 想定外の例外を拾ってログ可能にする
  // 埋め込んだ情報は Apollo Server の設定でレスポンスから除外すること
  fallbackError: (thrown, _parent, _args, _context, _info) => {
    // 想定通りの例外が起きた
    if (thrown instanceof ApolloError) {
      return thrown;
    }

    // 想定外の例外が起きた
    if (thrown instanceof Error) {
      return new ApolloError("Internal server error", ErrorCode.InternalServerError, {
        // オブジェクトにしないと pino のログが {} に化ける
        thrown: { name: thrown.name, stack: thrown.stack },
      });
    }

    // エラーでは無いものが投げられた
    return new ApolloError("Internal server error", ErrorCode.InternalServerError, {
      thrown,
    });
  },
});

const validationMiddleware = shield(validations);

export const middlewares = [validationMiddleware, permissionAndErrorMiddleware];
