import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";

import { TodoAPI, UserAPI } from "@/datasources";
import { Graph } from "@/graphql/types";
import type { Context } from "./types";
import { logger } from "./logger";
import { server } from "./server";
import { isIntrospectionQuery } from "./utils";

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

    const token = req.headers.authorization?.replace("Bearer ", "");

    const todoAPI = new TodoAPI();
    const userAPI = new UserAPI();

    let user;

    if (token) {
      const maybeUser = await userAPI.getByToken({ token });

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
        todoAPI,
        userAPI,
      },
    };
  },
})
  .then(({ url }) => console.log(`🚀  Server ready at ${url}`))
  .catch(console.error);
