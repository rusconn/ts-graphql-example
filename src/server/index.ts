import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";

import { TodoAPI, UserAPI } from "@/datasources";
import { Graph } from "@/graphql/types";
import type { Context } from "./types";
import { isIntrospectionQuery, makePrismaClient, makeLogger, makeServer } from "./utils";

const prisma = makePrismaClient();
const server = makeServer();

startStandaloneServer(server, {
  context: async ({ req, res }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { query } = req.body as { query: string | undefined };

    if (query && isIntrospectionQuery(query)) {
      return {} as Context;
    }

    // plugins では消せなかったのでここで消している
    res.removeHeader("x-powered-by");

    const logger = makeLogger();
    const token = req.headers.authorization?.replace("Bearer ", "");

    let user;

    if (token) {
      const maybeUser = await prisma.user.findUnique({ where: { token } });

      if (!maybeUser) {
        throw new GraphQLError("Authentication error", {
          extensions: { code: Graph.ErrorCode.AuthenticationError },
        });
      }

      user = maybeUser;
    } else {
      user = { id: "GUEST", role: "GUEST" } as const;
    }

    return {
      logger,
      user,
      dataSources: {
        todoAPI: new TodoAPI(prisma),
        userAPI: new UserAPI(prisma),
      },
    };
  },
})
  .then(({ url }) => console.log(`🚀  Server ready at ${url}`))
  .catch(console.error);
