import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";

import { isIntrospectionQuery } from "@/generic/graphql";
import * as Graph from "@/modules/common/schema";
import type { Context } from "@/modules/common/resolvers";
import { prisma } from "@/prisma";
import { logger } from "./logger";
import { server } from "./server";

startStandaloneServer(server, {
  context: async ({ req, res }) => {
    // TODO: 方法を変更する
    // @ts-expect-error: 内部情報にアクセスしているので型がついていない。
    const { query } = req.body as { query: string | undefined };

    if (query && isIntrospectionQuery(query)) {
      return {} as Context;
    }

    // TODO: ここで消すのはおかしいと思うので場所を変更する。
    res.removeHeader("x-powered-by");

    const token = req.headers.authorization?.replace("Bearer ", "");

    let user;

    if (token) {
      const maybeUser = await prisma.user.findUnique({
        where: { token },
        select: { id: true, role: true },
      });

      if (!maybeUser) {
        throw new GraphQLError("Authentication error", {
          extensions: { code: Graph.ErrorCode.AuthenticationError },
        });
      }

      user = maybeUser;
    } else {
      user = { id: "GUEST", role: "GUEST" } as const;
    }

    return { prisma, user, logger };
  },
})
  .then(({ url }) => console.log(`🚀  Server ready at ${url}`))
  .catch(console.error);
