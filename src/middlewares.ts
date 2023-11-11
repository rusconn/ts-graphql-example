import { GraphQLError } from "graphql";
import type { IMiddleware } from "graphql-middleware";

import * as Prisma from "@/prisma";
import { ErrorCode } from "@/modules/common/schema";
import { AuthorizationError } from "@/modules/common/authorizers";
import { ParseError } from "@/modules/common/parsers";

const errorHandling: IMiddleware = async (resolve, root, args, context, info) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/return-await
    return await resolve(root, args, context, info);
  } catch (thrown) {
    if (thrown instanceof AuthorizationError) {
      return new GraphQLError("Forbidden", {
        originalError: thrown,
        extensions: { code: ErrorCode.Forbidden },
      });
    }

    if (thrown instanceof ParseError) {
      return new GraphQLError(thrown.message, {
        originalError: thrown,
        extensions: { code: ErrorCode.BadUserInput },
      });
    }

    if (thrown instanceof Prisma.NotExistsError) {
      return new GraphQLError("Not found", {
        originalError: thrown,
        extensions: { code: ErrorCode.NotFound },
      });
    }

    if (thrown instanceof GraphQLError) {
      return thrown;
    }

    // 想定外のエラーが投げられた
    if (thrown instanceof Error) {
      return new GraphQLError("Internal server error", {
        originalError: thrown,
        extensions: { code: ErrorCode.InternalServerError },
      });
    }

    // エラーでは無いものが投げられた
    return new GraphQLError("Internal server error", {
      originalError: new Error(JSON.stringify(thrown)),
      extensions: { code: ErrorCode.InternalServerError },
    });
  }
};

export const middlewares = [errorHandling];
