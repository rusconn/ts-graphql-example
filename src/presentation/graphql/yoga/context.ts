import type { YogaInitialContext } from "graphql-yoga";
import type { HttpRequest, HttpResponse } from "uWebSockets.js";

import {
  type AppContext,
  type AppContextForAuthed,
  createAppContext,
  findAppContextUser,
} from "../../../application/context.ts";
import { kysely } from "../../../infrastructure/datasources/db/client.ts";
import { pino } from "../../../infrastructure/loggers/pino.ts";
import * as AccessToken from "../../_shared/auth/access-token.ts";
import { authenticationError } from "../schema/_errors/global/authentication-error.ts";
import { badUserInputError } from "../schema/_errors/global/bad-user-input.ts";
import { tokenExpiredError } from "../schema/_errors/global/token-expired.ts";

export type Context = ServerContext & YogaInitialContext & PluginContext & AppContext;
export type ContextForAuthed = ServerContext & YogaInitialContext & AppContextForAuthed;

export type ServerContext = {
  req: HttpRequest;
  res: HttpResponse;
};

export type PluginContext = {
  requestId?: string;
  start?: ReturnType<typeof Date.now>;
};

export const buildContext = async ({
  request,
  requestId,
}: ServerContext & YogaInitialContext & PluginContext): Promise<AppContext> => {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  let payload: AccessToken.Payload | null = null;
  if (token != null) {
    const result = await AccessToken.verify(token);
    switch (result.type) {
      case "Success":
        payload = result.payload;
        break;
      case "Invalid":
        throw authenticationError();
      case "Expired":
        throw tokenExpiredError();
      case "Unknown":
        throw badUserInputError("Bad token");
      default:
        throw new Error(result satisfies never);
    }
  }

  let user: AppContext["user"] = null;
  if (payload) {
    const found = await findAppContextUser(payload.id, kysely);
    if (found == null) {
      throw authenticationError();
    }
    user = found;
  }

  return createAppContext({
    user,
    logger: pino.child({ requestId }),
    kysely,
  });
};
